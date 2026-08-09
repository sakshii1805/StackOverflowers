import { cn } from "../../lib/utils";

const sizeMap = {
  sm: 36,
  md: 48,
  lg: 64,
};

const colorMap = {
  accent: "#39FF8C",
  critical: "#FF4D5E",
  high: "#FF9142",
  medium: "#39FF8C",
  low: "#5B8AA6",
};

function colorForValue(value) {
  if (value >= 85) return colorMap.critical;
  if (value >= 60) return colorMap.high;
  if (value >= 30) return colorMap.medium;
  return colorMap.low;
}

export default function ProgressRing({
  value = 0,
  max = 100,
  size = "md",
  color,
  showValue = true,
  className,
}) {
  const dim = sizeMap[size] || sizeMap.md;
  const strokeWidth = dim <= 36 ? 3 : 4;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = circumference * (1 - pct);
  const resolvedColor = color ? (colorMap[color] || color) : colorForValue(value);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} className="-rotate-90">
        {/* Track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 4px ${resolvedColor}60)`,
          }}
        />
      </svg>
      {showValue && (
        <span
          className="absolute text-[10px] font-mono font-medium"
          style={{ color: resolvedColor }}
        >
          {Math.round(value)}
        </span>
      )}
    </div>
  );
}
