"use client";

import { useState, useEffect, useCallback } from "react";
import { CallSenseHistory } from "@/types";
import { TranscriptInput } from "./TranscriptInput";
import { CallSenseAnalysisView } from "./CallSenseAnalysisView";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Props {
  leadId: string;
  leadName: string;
}

export function CallSenseSection({ leadId, leadName }: Props) {
  const [history, setHistory] = useState<CallSenseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}/callsense`);
      if (!res.ok) return;
      const data = await res.json();
      const records: CallSenseHistory[] = data.history ?? [];
      setHistory(records);
      // Auto-select the most recent
      if (records.length > 0 && !selectedId) {
        setSelectedId(records[records.length - 1].id);
      }
    } finally {
      setLoading(false);
    }
  }, [leadId, selectedId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleAnalysisComplete = async () => {
    setLoading(true);
    setShowNewAnalysis(false);
    await fetchHistory();
    setLoading(false);
  };

  const handleRecordChange = (updated: CallSenseHistory) => {
    setHistory((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const selectedRecord = history.find((r) => r.id === selectedId);

  return (
    <div>
      {/* CallSense header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <h2 className="text-lg font-bold text-slate-900">CallSense</h2>
            <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">AI Conversation Intelligence</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Analyze call and meeting transcripts for {leadName} — extract requirements, track questions, verify claims.
          </p>
        </div>
        <button
          onClick={() => setShowNewAnalysis(true)}
          className="btn-primary text-sm shrink-0"
        >
          + Analyze Transcript
        </button>
      </div>

      {/* New analysis input */}
      {showNewAnalysis && (
        <div className="card p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">New Transcript Analysis</h3>
            <button onClick={() => setShowNewAnalysis(false)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
          </div>
          <TranscriptInput leadId={leadId} onAnalysisComplete={handleAnalysisComplete} />
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      )}

      {!loading && history.length === 0 && !showNewAnalysis && (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-slate-700">No conversation analyses yet</p>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Paste a call or meeting transcript to extract customer requirements, track unanswered questions, and verify claims.
          </p>
          <button onClick={() => setShowNewAnalysis(true)} className="btn-primary text-sm">
            Analyze First Transcript
          </button>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="space-y-4">
          {/* History selector */}
          {history.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {history.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                    selectedId === r.id
                      ? "bg-purple-100 border-purple-300 text-purple-800"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Analysis {i + 1} — {new Date(r.createdAt).toLocaleDateString()}
                </button>
              ))}
            </div>
          )}

          {/* Selected analysis */}
          {selectedRecord && (
            <CallSenseAnalysisView
              record={selectedRecord}
              leadId={leadId}
              onRecordChange={handleRecordChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
