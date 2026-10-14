import { VerificationStatus } from "@/types";

const config: Record<VerificationStatus, { cls: string; icon: string }> = {
  "Verified against available data": {
    cls: "bg-green-100 text-green-800 border-green-200",
    icon: "✓",
  },
  "Unverified": {
    cls: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "⚠",
  },
  "Conflict — Human Review Required": {
    cls: "bg-red-100 text-red-800 border-red-200",
    icon: "✗",
  },
  "Unsupported by Available Data": {
    cls: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "?",
  },
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const { cls, icon } = config[status] ?? config["Unverified"];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${cls}`}>
      {icon} {status}
    </span>
  );
}
