// src/pages/Settings.jsx
import { useState } from "react";
import { Settings as SettingsIcon, Sliders, Database, Info } from "lucide-react";

const REFRESH_OPTIONS = ["Real-time", "30 seconds", "1 minute", "5 minutes"];

export default function SettingsPage() {
  const [compactMode, setCompactMode] = useState(false);
  const [showDemoLabels, setShowDemoLabels] = useState(true);
  const [glowEffects, setGlowEffects] = useState(true);

  const [anomalyThreshold, setAnomalyThreshold] = useState(20);
  const [refreshRate, setRefreshRate] = useState("30 seconds");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="eyebrow flex items-center gap-1.5">
        <SettingsIcon size={13} /> Settings
      </div>

      {/* Appearance */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="eyebrow">Appearance</div>

        <ToggleRow
          label="Compact mode"
          description="Reduce padding and font size across tables and cards."
          checked={compactMode}
          onChange={setCompactMode}
        />
        <ToggleRow
          label="Show demo-mode labels"
          description="Display the DEMO MODE / SYNTHETIC DATA badges throughout the UI."
          checked={showDemoLabels}
          onChange={setShowDemoLabels}
        />
        <ToggleRow
          label="Glow effects"
          description="Enable the neon glow/pulse styling on status indicators."
          checked={glowEffects}
          onChange={setGlowEffects}
        />
      </div>

      {/* Data & Monitoring */}
      <div className="glass-panel p-6 flex flex-col gap-5">
        <div className="eyebrow flex items-center gap-1.5">
          <Sliders size={12} /> Data &amp; Monitoring
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12.5px]">
            <span>Anomaly detection threshold</span>
            <span className="font-mono text-text-dim">{anomalyThreshold}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={80}
            step={5}
            value={anomalyThreshold}
            onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
            className="w-full accent-accent-neon"
          />
          <p className="text-[11px] text-text-faint">
            Sectors deviating above this percentage from baseline are flagged as anomalies.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[12.5px]">Refresh rate</span>
          <select
            value={refreshRate}
            onChange={(e) => setRefreshRate(e.target.value)}
            className="text-[12px] bg-surface-2 border border-border rounded-lg px-2.5 py-2 text-text-dim outline-none w-48"
          >
            {REFRESH_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-text-faint">
            How often the intelligence engine re-evaluates sector activity.
          </p>
        </div>
      </div>

      {/* About / Data source */}
      <div className="glass-panel p-6 flex flex-col gap-2">
        <div className="eyebrow flex items-center gap-1.5">
          <Database size={12} /> Data Source
        </div>
        <p className="text-[12px] text-text-dim flex items-start gap-2">
          <Info size={14} className="text-text-faint shrink-0 mt-0.5" />
          All entities, relationships, alerts, and OSINT mentions in NARCOSCOPE are
          synthetically generated for demonstration purposes. No real individuals,
          vehicles, organizations, or events are represented.
        </p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[12.5px]">{label}</div>
        <div className="text-[11px] text-text-faint">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-accent-neon" : "bg-surface-2 border border-border"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-bg transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}