"use client";

import { Lead } from "@/types";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Props {
  lead: Lead;
  onReanalyze: () => void;
  reanalyzing: boolean;
}

export function LeadAnalysis({ lead, onReanalyze, reanalyzing }: Props) {
  const { analysis, analysisError } = lead;

  if (reanalyzing) {
    return (
      <div className="card p-8 flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600 text-sm">Running AI analysis with Gemini 3.8 Flash…</p>
      </div>
    );
  }

  if (analysisError && !analysis) {
    return (
      <div className="card p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 font-medium text-sm">AI analysis failed</p>
          <p className="text-red-600 text-sm mt-1">{analysisError}</p>
          {analysisError.includes("GEMINI_API_KEY") && (
            <p className="text-red-500 text-xs mt-2">
              Add your Gemini API key to <code>.env.local</code> and restart the server.
              Get a free key at{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                aistudio.google.com
              </a>
            </p>
          )}
        </div>
        <button onClick={onReanalyze} className="btn-primary text-sm">Retry Analysis</button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card p-8 flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600 text-sm">Waiting for AI analysis…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Priority + summary */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <PriorityBadge priority={analysis.priority} score={analysis.priorityScore} />
          <span className="text-xs text-slate-500 italic">{analysis.priorityReason}</span>
        </div>
        <p className="text-slate-700 text-sm">{analysis.summary}</p>
      </div>

      {/* Grid of analysis sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer intent */}
        <div className="card p-4">
          <h3 className="section-heading">🎯 Customer Intent</h3>
          <p className="text-sm text-slate-700">{analysis.customerIntent}</p>
        </div>

        {/* Recommended next action */}
        <div className="card p-4 border-l-4 border-l-blue-500">
          <h3 className="section-heading">✅ Recommended Next Action</h3>
          <p className="text-sm text-slate-700 font-medium">{analysis.recommendedNextAction}</p>
        </div>
      </div>

      {/* Key requirements */}
      {analysis.keyRequirements.length > 0 && (
        <div className="card p-4">
          <h3 className="section-heading">📋 Key Requirements</h3>
          <ul className="space-y-1">
            {analysis.keyRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-green-500 mt-0.5 shrink-0">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Objections & concerns */}
      {analysis.objectionsConcerns.length > 0 && (
        <div className="card p-4">
          <h3 className="section-heading">⚠️ Objections &amp; Concerns</h3>
          <ul className="space-y-1">
            {analysis.objectionsConcerns.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested response */}
      <div className="card p-4 bg-blue-50 border-blue-100">
        <h3 className="section-heading">💬 Suggested Response to Customer</h3>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{analysis.suggestedResponse}</p>
      </div>

      {/* Re-analyze */}
      <div className="flex justify-end">
        <button onClick={onReanalyze} disabled={reanalyzing} className="btn-secondary text-xs">
          ↻ Re-analyze
        </button>
      </div>
    </div>
  );
}
