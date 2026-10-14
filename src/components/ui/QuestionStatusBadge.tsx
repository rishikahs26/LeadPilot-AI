import { QuestionStatus } from "@/types";

const config: Record<QuestionStatus, { cls: string; icon: string }> = {
  "Answered": { cls: "bg-green-100 text-green-800", icon: "✓" },
  "Partially answered": { cls: "bg-amber-100 text-amber-800", icon: "◑" },
  "Unanswered": { cls: "bg-red-100 text-red-800", icon: "✗" },
  "Needs verification": { cls: "bg-purple-100 text-purple-800", icon: "?" },
};

export function QuestionStatusBadge({ status }: { status: QuestionStatus }) {
  const { cls, icon } = config[status] ?? config["Unanswered"];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${cls}`}>
      {icon} {status}
    </span>
  );
}
