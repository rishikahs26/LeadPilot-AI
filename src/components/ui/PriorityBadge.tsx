import { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  score?: number;
}

export function PriorityBadge({ priority, score }: PriorityBadgeProps) {
  const icons: Record<Priority, string> = {
    hot: "🔥",
    warm: "☀️",
    cold: "❄️",
  };
  const labels: Record<Priority, string> = {
    hot: "Hot",
    warm: "Warm",
    cold: "Cold",
  };

  return (
    <span className={`badge-${priority}`}>
      {icons[priority]} {labels[priority]}{score ? ` · ${score}` : ""}
    </span>
  );
}
