"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Props {
  leadId: string;
  onAnalysisComplete: () => void;
}

const EXAMPLE_TRANSCRIPT = `Customer: I need a 3BHK apartment in Whitefield. My budget is around ₹80 lakh, and I need possession by December. Is there any discount available?

Salesperson: We have some options. Possession by December should be possible, and I think we can offer a discount.

Customer: Does the apartment include covered parking? I need to discuss the final decision with my family.`;

export function TranscriptInput({ leadId, onAnalysisComplete }: Props) {
  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError("Please paste a transcript before analyzing.");
      return;
    }
    if (transcript.trim().length < 20) {
      setError("Transcript is too short to analyze meaningfully.");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/callsense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        return;
      }

      setTranscript(""); // clear after successful analysis
      onAnalysisComplete();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const loadExample = () => {
    setTranscript(EXAMPLE_TRANSCRIPT);
    setError(null);
  };

  return (
    <div className="space-y-3">
      {/* Empty state hint */}
      {!transcript && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">How to use CallSense</p>
          <p className="text-blue-600">
            Paste a call or meeting transcript below — the salesperson&apos;s and customer&apos;s lines, one after the other.
            CallSense will extract requirements, identify unanswered questions, flag unverified claims, and generate a safe follow-up message.
          </p>
          <button onClick={loadExample} className="mt-2 text-xs underline text-blue-700 hover:text-blue-900">
            Load example transcript
          </button>
        </div>
      )}

      <textarea
        value={transcript}
        onChange={(e) => { setTranscript(e.target.value); if (error) setError(null); }}
        placeholder={"Paste call or meeting transcript here...\n\nExample:\nCustomer: I'm looking for a 3BHK in Whitefield...\nSalesperson: We have some options available..."}
        rows={8}
        className="textarea font-mono text-xs"
        disabled={analyzing}
        aria-label="Conversation transcript"
        maxLength={10000}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{transcript.length}/10,000 characters</span>
        {transcript && !analyzing && (
          <button onClick={() => setTranscript("")} className="text-xs text-slate-400 hover:text-slate-600">
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={analyzing || !transcript.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {analyzing ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Analyzing conversation…</span>
          </>
        ) : "Analyze Conversation"}
      </button>

      {analyzing && (
        <p className="text-xs text-slate-500 text-center">
          Running transcript analysis and fact-checking with Gemini 3.8 Flash… may take 5–10 seconds.
        </p>
      )}
    </div>
  );
}
