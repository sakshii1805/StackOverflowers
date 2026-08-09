import { cn } from "../../lib/utils";

const colorMap = {
  accent: "text-accent-neon",
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
};

const glowMap = {
  accent: "shadow-[0_0_20px_rgba(57,255,140,0.15)]",
  critical: "shadow-[0_0_20px_rgba(255,77,94,0.15)]",
  high: "shadow-[0_0_20px_rgba(255,145,66,0.15)]",
  medium: "shadow-[0_0_20px_rgba(57,255,140,0.1)]",
  low: "shadow-[0_0_20px_rgba(91,138,166,0.1)]",
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color = "accent",
  className,
}) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div
      className={cn(
        "glass-panel p-5 flex flex-col gap-3 group hover:border-border-strong transition-all duration-300",
        glowMap[color],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        {Icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center transition-colors group-hover:bg-accent-dim",
              colorMap[color]
            )}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className={cn("text-2xl font-semibold tracking-tight", colorMap[color])}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {change !== undefined && change !== null && (
          <span
            className={cn(
              "text-xs font-mono pb-0.5",
              isPositive && "text-accent-neon",
              isNegative && "text-critical",
              !isPositive && !isNegative && "text-text-faint"
            )}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
    </div>
  );
}
