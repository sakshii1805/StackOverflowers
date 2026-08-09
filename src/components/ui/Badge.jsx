import { cn } from "../../lib/utils";

const variants = {
  severity: {
    critical: "bg-critical/15 text-critical border-critical/30",
    high: "bg-high/15 text-high border-high/30",
    medium: "bg-medium/15 text-medium border-medium/30",
    low: "bg-low/15 text-low border-low/30",
  },
  status: {
    active: "bg-accent-neon/15 text-accent-neon border-accent-neon/30",
    inactive: "bg-text-faint/15 text-text-faint border-text-faint/30",
    under_investigation: "bg-high/15 text-high border-high/30",
    cleared: "bg-low/15 text-low border-low/30",
    new: "bg-accent-neon/15 text-accent-neon border-accent-neon/30",
    investigating: "bg-high/15 text-high border-high/30",
    resolved: "bg-text-faint/15 text-text-faint border-text-faint/30",
    open: "bg-accent-neon/15 text-accent-neon border-accent-neon/30",
    in_progress: "bg-high/15 text-high border-high/30",
    closed: "bg-text-faint/15 text-text-faint border-text-faint/30",
  },
  type: {
    person: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    vehicle: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    location: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    shipment: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    organization: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    phone: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    financial_account: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
};

export default function Badge({ variant = "severity", value, className, dot }) {
  const colorSet = variants[variant] || variants.severity;
  const colors = colorSet[value] || "bg-surface-2 text-text-dim border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border",
        colors,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            value === "critical" || value === "active" || value === "new"
              ? "animate-pulse-glow"
              : "",
            "bg-current"
          )}
        />
      )}
      {value?.replace(/_/g, " ")}
    </span>
  );
}
