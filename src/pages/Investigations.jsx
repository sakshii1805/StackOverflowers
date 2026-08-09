// src/pages/Investigations.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp, FolderKanban, Clock } from "lucide-react";
import {
  INVESTIGATIONS,
  INVESTIGATION_TIMELINES,
  getEntityById,
  ALERTS,
} from "../lib/mockData";

const STATUS_STYLES = {
  active: "bg-accent-dim text-accent-neon border-accent-neon/30",
  open: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  closed: "bg-surface-2 text-text-faint border-border",
};

const PRIORITY_STYLES = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-text-faint",
};

export default function Investigations() {
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col gap-4">
      <div className="eyebrow flex items-center gap-1.5">
        <FolderKanban size={13} /> Investigations ({INVESTIGATIONS.length})
      </div>

      <div className="flex flex-col gap-3">
        {INVESTIGATIONS.map((inv) => {
          const isExpanded = expandedId === inv.id;
          const timeline = INVESTIGATION_TIMELINES[inv.id] ?? [];
          const relatedAlerts = ALERTS.filter((a) => inv.alertIds.includes(a.id));

          return (
            <div key={inv.id} className="glass-panel p-5">
              <button
                type="button"
                onClick={() => toggle(inv.id)}
                className="w-full flex items-start justify-between text-left gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[14px] font-semibold">{inv.title}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                    <span className={`text-[10.5px] font-mono uppercase ${PRIORITY_STYLES[inv.priority]}`}>
                      {inv.priority} priority
                    </span>
                  </div>
                  <p className="text-[12px] text-text-dim">{inv.description}</p>
                  <span className="text-[10.5px] text-text-faint">Opened {inv.createdAt}</span>
                </div>
                <span className="text-text-faint shrink-0 pt-1">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-4">
                  {/* Timeline */}
                  <div>
                    <div className="eyebrow mb-2 flex items-center gap-1.5">
                      <Clock size={12} /> Timeline
                    </div>
                    <div className="flex flex-col gap-2">
                      {timeline.length > 0 ? (
                        timeline.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 text-[12px]">
                            <span className="font-mono text-text-faint w-12 shrink-0">{t.time}</span>
                            <span className="text-text-dim">{t.description}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[12px] text-text-faint">No timeline events recorded.</p>
                      )}
                    </div>
                  </div>

                  {/* Related entities */}
                  <div>
                    <div className="eyebrow mb-2">Related Entities</div>
                    <div className="flex flex-wrap gap-1.5">
                      {inv.entityIds.map((eid) => {
                        const e = getEntityById(eid);
                        return (
                          <span
                            key={eid}
                            className="text-[11px] text-text-dim bg-surface-2 px-2 py-1 rounded-lg"
                          >
                            {e?.label ?? eid}
                          </span>
                        );
                      })}
                      {inv.entityIds.length === 0 && (
                        <p className="text-[11px] text-text-faint">No entities linked.</p>
                      )}
                    </div>
                  </div>

                  {/* Related alerts */}
                  <div>
                    <div className="eyebrow mb-2">Related Alerts</div>
                    <div className="flex flex-col gap-1">
                      {relatedAlerts.length > 0 ? (
                        relatedAlerts.map((a) => (
                          <div key={a.id} className="text-[12px] text-text-dim">
                            {a.title}
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-text-faint">No alerts linked.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}