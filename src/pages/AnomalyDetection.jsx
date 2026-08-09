// src/pages/AnomalyDetection.jsx
import { useState, useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { AlertTriangle, ArrowUpDown } from "lucide-react";
import { ANOMALIES, getSectorById } from "../lib/mockData";

const SEVERITY_STYLES = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-accent-dim text-accent-neon border-accent-neon/30",
};

const SEVERITY_GLOW = {
  critical: "shadow-[0_0_20px_-6px_rgba(248,113,113,0.5)] border-red-500/40",
  high: "shadow-[0_0_20px_-6px_rgba(251,146,60,0.5)] border-orange-500/40",
  medium: "shadow-[0_0_20px_-6px_rgba(251,191,36,0.5)] border-amber-500/40",
  low: "shadow-[0_0_20px_-6px_rgba(57,255,136,0.4)] border-accent-neon/40",
};

const SORT_KEYS = {
  sector: (a) => getSectorById(a.sectorId).name,
  deviation: (a) => a.deviationPct,
  severity: (a) => a.severity,
};

export default function AnomalyDetection() {
  const [hoveredId, setHoveredId] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("desc");

  const sortedAnomalies = useMemo(() => {
    if (!sortKey) return ANOMALIES;
    const getVal = SORT_KEYS[sortKey];
    const sorted = [...ANOMALIES].sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Anomaly cards with sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ANOMALIES.map((a) => {
          const sector = getSectorById(a.sectorId);
          const sparkData = sector.trend.map((v, i) => ({ i, v }));
          const isHovered = hoveredId === a.id;
          return (
            <div
              key={a.id}
              onMouseEnter={() => setHoveredId(a.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`glass-panel p-4 flex flex-col gap-3 border transition-all duration-200 cursor-default ${
                isHovered
                  ? `-translate-y-1 ${SEVERITY_GLOW[a.severity]}`
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[13px] font-semibold">{a.label}</div>
                  <div className="text-[11px] text-text-faint">{sector.name}</div>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border transition-transform duration-200 ${
                    SEVERITY_STYLES[a.severity]
                  } ${isHovered ? "scale-110" : ""}`}
                >
                  {a.severity}
                </span>
              </div>

              <div className="h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#39ff88"
                      strokeWidth={isHovered ? 2.5 : 2}
                      dot={false}
                      activeDot={{ r: 3, fill: "#39ff88" }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-faint">
                  Baseline {a.baseline} → Observed {a.observed}
                </span>
                <span
                  className={`font-mono transition-colors duration-200 ${
                    isHovered ? "text-text" : "text-text-dim"
                  }`}
                >
                  {a.deviationPct > 0 ? "+" : ""}
                  {a.deviationPct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="glass-panel p-6 overflow-x-auto">
        <div className="eyebrow mb-4 flex items-center gap-1.5">
          <AlertTriangle size={13} /> All Detected Anomalies
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-text-faint border-b border-border">
              <th className="pb-2 pr-4 font-normal">
                <button
                  onClick={() => toggleSort("sector")}
                  className="flex items-center gap-1 hover:text-text transition-colors"
                >
                  Sector <ArrowUpDown size={11} className={sortKey === "sector" ? "text-accent-neon" : ""} />
                </button>
              </th>
              <th className="pb-2 pr-4 font-normal">Description</th>
              <th className="pb-2 pr-4 font-normal">Baseline</th>
              <th className="pb-2 pr-4 font-normal">Observed</th>
              <th className="pb-2 pr-4 font-normal">
                <button
                  onClick={() => toggleSort("deviation")}
                  className="flex items-center gap-1 hover:text-text transition-colors"
                >
                  Deviation <ArrowUpDown size={11} className={sortKey === "deviation" ? "text-accent-neon" : ""} />
                </button>
              </th>
              <th className="pb-2 font-normal">
                <button
                  onClick={() => toggleSort("severity")}
                  className="flex items-center gap-1 hover:text-text transition-colors"
                >
                  Severity <ArrowUpDown size={11} className={sortKey === "severity" ? "text-accent-neon" : ""} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAnomalies.map((a) => {
              const sector = getSectorById(a.sectorId);
              const isHovered = hoveredId === a.id;
              return (
                <tr
                  key={a.id}
                  onMouseEnter={() => setHoveredId(a.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`border-b border-border/50 cursor-default transition-colors duration-150 ${
                    isHovered ? "bg-white/[0.04]" : ""
                  }`}
                >
                  <td className="py-2 pr-4">{sector.name}</td>
                  <td className="py-2 pr-4 text-text-dim">{a.label}</td>
                  <td className="py-2 pr-4 font-mono">{a.baseline}</td>
                  <td className="py-2 pr-4 font-mono">{a.observed}</td>
                  <td className="py-2 pr-4 font-mono">
                    {a.deviationPct > 0 ? "+" : ""}
                    {a.deviationPct}%
                  </td>
                  <td className="py-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border transition-transform duration-200 ${
                        SEVERITY_STYLES[a.severity]
                      } ${isHovered ? "scale-110" : ""}`}
                    >
                      {a.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}