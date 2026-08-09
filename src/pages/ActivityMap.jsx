// src/pages/ActivityMap.jsx
import { useState } from "react";
import { AlertTriangle, Users } from "lucide-react";
import { SECTORS, getEntitiesBySector, getAlertsBySector } from "../lib/mockData";

function heatColor(score) {
  const alpha = 0.12 + score * 0.55;
  return `rgba(57, 255, 136, ${alpha.toFixed(2)})`;
}

function heatBorder(score) {
  const alpha = 0.25 + score * 0.6;
  return `rgba(57, 255, 136, ${alpha.toFixed(2)})`;
}

export default function ActivityMap() {
  const [selectedId, setSelectedId] = useState(null);
  const selected = SECTORS.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      <div className="glass-panel flex-1 p-6 overflow-y-auto">
        <div className="eyebrow mb-4">Sector Activity Map</div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {SECTORS.map((s) => {
            const isSelected = s.id === selectedId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : s.id)}
                className="rounded-xl p-4 text-left transition-all border"
                style={{
                  background: heatColor(s.anomalyScore),
                  borderColor: isSelected ? "#39ff88" : heatBorder(s.anomalyScore),
                  boxShadow: isSelected ? "0 0 0 1px #39ff88" : "none",
                }}
              >
                <div className="text-[10px] font-mono text-text-faint">{s.id}</div>
                <div className="text-[13px] font-semibold mt-0.5">
                  {s.name.replace(/^Sector \d+ — /, "")}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-text-dim">Activity</span>
                  <span className="text-[13px] font-mono">{s.activityCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-dim">Anomaly</span>
                  <span className="text-[13px] font-mono">{Math.round(s.anomalyScore * 100)}%</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mt-6 text-[11px] text-text-faint">
          <span>Low activity</span>
          <div className="flex h-2 w-32 rounded-full overflow-hidden">
            <div className="flex-1" style={{ background: heatColor(0.05) }} />
            <div className="flex-1" style={{ background: heatColor(0.3) }} />
            <div className="flex-1" style={{ background: heatColor(0.6) }} />
            <div className="flex-1" style={{ background: heatColor(1) }} />
          </div>
          <span>High anomaly</span>
        </div>
      </div>

      <div className="glass-panel w-80 shrink-0 p-4 overflow-y-auto">
        <div className="eyebrow mb-3">Sector Details</div>
        {selected ? (
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[15px] font-semibold">{selected.name}</div>
              <div className="text-[11px] text-text-faint">{selected.id}</div>
            </div>

            <div className="flex flex-col gap-1.5 text-[12px]">
              <Row label="Baseline" value={selected.baseline} />
              <Row label="Current Activity" value={selected.activityCount} />
              <Row label="Anomaly Score" value={`${Math.round(selected.anomalyScore * 100)}%`} />
            </div>

            <div>
              <div className="eyebrow mb-2 flex items-center gap-1.5">
                <Users size={12} /> Entities in Sector
              </div>
              <div className="flex flex-col gap-1">
                {getEntitiesBySector(selected.id).slice(0, 6).map((e) => (
                  <div key={e.id} className="text-[12px] text-text-dim flex items-center justify-between">
                    <span>{e.label}</span>
                    <span className="text-text-faint capitalize">{e.type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow mb-2 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Alerts
              </div>
              {getAlertsBySector(selected.id).length > 0 ? (
                <div className="flex flex-col gap-1">
                  {getAlertsBySector(selected.id).map((a) => (
                    <div key={a.id} className="text-[12px] text-text-dim">
                      {a.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-text-faint">No active alerts.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-text-dim text-[12px]">
            Click a sector tile to view details, entities, and alerts.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-faint">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}