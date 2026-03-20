import type { ProjectStatus } from "@/types";

interface BadgeProps {
  status: ProjectStatus;
}

export default function Badge({ status }: BadgeProps) {
  const cls =
    status === "LIVE"
      ? "badge badge-live"
      : status === "IN PROGRESS"
        ? "badge badge-wip"
        : "badge badge-complete";

  const dot =
    status === "LIVE" ? "var(--green)" : status === "IN PROGRESS" ? "var(--amber)" : "var(--t3)";

  return (
    <span className={cls}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
