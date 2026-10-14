import { CustomerQuestion } from "@/types";
import { QuestionStatusBadge } from "@/components/ui/QuestionStatusBadge";

interface Props {
  questions: CustomerQuestion[];
  unansweredQuestions: string[];
}

export function QuestionTracker({ questions, unansweredQuestions }: Props) {
  if (questions.length === 0) {
    return (
      <p className="text-slate-400 text-sm italic">No customer questions identified in this transcript.</p>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-3 bg-white">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-slate-800 flex-1">{q.question}</p>
            <QuestionStatusBadge status={q.status} />
          </div>
          {q.statusReason && (
            <p className="text-xs text-slate-500 mt-1.5 italic">{q.statusReason}</p>
          )}
        </div>
      ))}

      {unansweredQuestions.length > 0 && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-700 mb-1.5">⚠ Unanswered questions requiring follow-up:</p>
          <ul className="space-y-1">
            {unansweredQuestions.map((q, i) => (
              <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">•</span> {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
