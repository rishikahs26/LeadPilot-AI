"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Props {
  leadId: string;
  leadName: string;
}

// Suggested questions for quick access
const SUGGESTIONS = [
  "What should I emphasize on the call?",
  "Make my reply more assertive.",
  "What are the customer's main concerns?",
  "What information is still missing?",
  "Write a shorter follow-up message.",
  "What should I verify before recommending a property?",
];

export function LeadChat({ leadId, leadName }: Props) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}/chat`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.history ?? []);
    } finally {
      setFetching(false);
    }
  }, [leadId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setError(null);
    setLoading(true);

    // Optimistic UI — add user message immediately
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      leadId,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/leads/${leadId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to get a response. Please try again.");
        // Remove the optimistic user message on failure
        setHistory((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        return;
      }

      // Replace temp message + add assistant message
      setHistory((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch {
      setError("Network error. Please check your connection.");
      setHistory((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex flex-col" style={{ height: "520px" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">💬 Conversational Assistant</h3>
        <p className="text-xs text-slate-500">Ask questions about {leadName}&apos;s lead — answers are grounded in their context.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {fetching && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {!fetching && history.length === 0 && (
          <div className="text-center py-6">
            <p className="text-slate-400 text-sm">No conversation yet. Try asking:</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-900 rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === "user" ? "text-blue-200" : "text-slate-400"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-xs text-slate-500">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      )}

      {/* Suggestions (shown when there are already messages) */}
      {!fetching && history.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this lead…"
            className="input flex-1 text-sm py-1.5"
            disabled={loading}
            aria-label="Chat message"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary text-sm px-3 py-1.5"
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
