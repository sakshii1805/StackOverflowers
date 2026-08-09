// src/pages/Dashboard.jsx
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Share2,
  MapPin,
  Bell,
  FolderKanban,
  AlertTriangle,
} from "lucide-react";
import { SECTORS, DATASET_SUMMARY } from "../lib/mockData";

const SUMMARY_CARDS = [
  { key: "totalEntities", label: "Entities", icon: Users, tint: "#39ff88" },
  { key: "totalRelationships", label: "Relationships", icon: Share2, tint: "#4dd0ff" },
  { key: "totalSectors", label: "Sectors", icon: MapPin, tint: "#ffb84d" },
  { key: "totalAlerts", label: "Alerts", icon: Bell, tint: "#ff6b6b" },
  { key: "activeInvestigations", label: "Active Investigations", icon: FolderKanban, tint: "#c084fc" },
  { key: "totalAnomalies", label: "Anomalies", icon: AlertTriangle, tint: "#f5d76e" },
];

// Sector activity vs baseline, for the bar chart
const sectorBarData = SECTORS.map((s) => ({
  name: s.id,
  fullName: s.name.replace(/^Sector \d+ — /, ""),
  baseline: s.baseline,
  observed: s.activityCount,
}));

// Aggregate network-wide trend across all sectors, for the line chart
const monthLabels = ["M1", "M2", "M3", "M4", "M5", "M6"];
const trendLineData = monthLabels.map((month, i) => ({
  month,
  activity: SECTORS.reduce((sum, s) => sum + s.trend[i], 0),
}));

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const full = payload[0]?.payload?.fullName;
  return (
    <div className="bg-[#12151c] border border-border rounded-lg px-3 py-2 text-[11px]">
      <div className="text-text-faint font-mono mb-1">{full ?? label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill ?? p.stroke }} />
          <span className="text-text-dim capitalize">{p.dataKey}</span>
          <span className="ml-auto font-mono text-text">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SUMMARY_CARDS.map(({ key, label, icon: Icon, tint }) => (
          <div
            key={key}
            className="glass-panel p-4 flex flex-col gap-3 hover:border-[color:var(--tint)] transition-colors"
            style={{ "--tint": `${tint}55` }}
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow leading-tight">{label}</span>
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                style={{ background: `${tint}1f`, color: tint }}
              >
                <Icon size={14} />
              </span>
            </div>
            <span className="text-[26px] font-semibold leading-none">{DATASET_SUMMARY[key]}</span>
          </div>
        ))}
      </div>

      {/* Sector activity bar chart */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="eyebrow">Sector Activity — Baseline vs Observed</div>
          <div className="flex items-center gap-4 text-[11px] text-text-dim">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3a4152" }} />
              Baseline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#39ff88" }} />
              Observed
            </span>
          </div>
        </div>
        <div className="h-72 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorBarData} barGap={2} barCategoryGap="28%">
              <defs>
                <linearGradient id="observedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#39ff88" stopOpacity={1} />
                  <stop offset="100%" stopColor="#39ff88" stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis
                dataKey="name"
                stroke="#4a5162"
                tick={{ fill: "#8b93a7", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                stroke="#4a5162"
                tick={{ fill: "#8b93a7", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="baseline" fill="#3a4152" radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Bar dataKey="observed" fill="url(#observedFill)" radius={[3, 3, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network-wide trend line chart */}
      <div className="glass-panel p-6">
        <div className="eyebrow mb-5">Network Activity Trend (6-Month)</div>
        <div className="h-64 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendLineData}>
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#39ff88" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#39ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis
                dataKey="month"
                stroke="#4a5162"
                tick={{ fill: "#8b93a7", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                stroke="#4a5162"
                tick={{ fill: "#8b93a7", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(57,255,136,0.3)" }} />
              <Line
                type="monotone"
                dataKey="activity"
                stroke="#39ff88"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#39ff88", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#39ff88", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}