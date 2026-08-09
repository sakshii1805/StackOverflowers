// src/pages/Alerts.jsx
import { useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { ALERTS as INITIAL_ALERTS, getSectorById, getEntityById } from "../lib/mockData";

const SEVERITY_STYLES = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-accent-dim text-accent-neon border-accent-neon/30",
};

const STATUS_COLUMNS = [
  { key: "new", label: "New" },
  { key: "investigating", label: "Investigating" },
  { key: "resolved", label: "Resolved" },
];

const NEXT_STATUS = {
  new: "investigating",
  investigating: "resolved",
  resolved: "new",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const advanceStatus = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: NEXT_STATUS[a.status] } : a))
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="eyebrow flex items-center gap-1.5">
        <Bell size={13} /> Alert Center
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const columnAlerts = alerts.filter((a) => a.status === col.key);
          return (
            <div key={col.key} className="glass-panel p-4 flex flex-col gap-3 min-h-[200px]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-text-dim">
                  {col.label}
                </span>
                <span className="text-[11px] font-mono text-text-faint">{columnAlerts.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {columnAlerts.length === 0 && (
                  <p className="text-[11px] text-text-faint">No alerts here.</p>
                )}
                {columnAlerts.map((a) => {
                  const sector = getSectorById(a.sectorId);
                  return (
                    <div key={a.id} className="border border-border rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[12.5px] font-medium">{a.title}</span>
                        <span
                          className={`shrink-0 text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded-full border ${SEVERITY_STYLES[a.severity]}`}
                        >
                          {a.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-dim">{a.reason}</p>
                      <div className="text-[10.5px] text-text-faint">{sector?.name}</div>

                      <div className="flex flex-wrap gap-1">
                        {a.relatedEntities.map((eid) => {
                          const e = getEntityById(eid);
                          return (
                            <span
                              key={eid}
                              className="text-[10px] text-text-faint bg-surface-2 px-1.5 py-0.5 rounded"
                            >
                              {e?.label ?? eid}
                            </span>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => advanceStatus(a.id)}
                        className="mt-1 self-start flex items-center gap-1 text-[11px] text-accent-neon hover:underline"
                      >
                        Move to {STATUS_COLUMNS.find((c) => c.key === NEXT_STATUS[a.status])?.label}
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}