import { FactCheckResult } from "@/types";
import { VerificationBadge } from "@/components/ui/VerificationBadge";

interface Props {
  results: FactCheckResult[];
}

export function FactCheckerResults({ results }: Props) {
  if (results.length === 0) {
    return (
      <p className="text-slate-400 text-sm italic">
        No verifiable claims were extracted from this transcript. Fact-checking runs on budget, possession, discount, and parking claims.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        ⚠ <strong>Illustrative data only.</strong> The property database used here contains demo records and does not represent real or current inventory. Always verify with authorized sources.
      </p>

      {results.map((r, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-medium text-slate-900 flex-1">{r.claim}</p>
            <VerificationBadge status={r.status} />
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Evidence</span>
              <p className="text-xs text-slate-700 mt-0.5">{r.evidence}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recommendation</span>
              <p className="text-xs text-slate-700 mt-0.5">{r.recommendation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
