import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function MiniChart({
  data,
  dataKey = "value",
  color = "#39FF8C",
  height = 40,
  className,
}) {
  // Accept array of numbers or array of objects
  const chartData = data.map((d, i) =>
    typeof d === "number" ? { idx: i, [dataKey]: d } : d
  );

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`mini-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#mini-grad-${color.replace("#", "")})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
