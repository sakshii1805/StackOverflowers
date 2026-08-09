// src/pages/OsintIntelligence.jsx
import { useState } from "react";
import { Radar, ShieldCheck } from "lucide-react";
import { OSINT_MENTIONS, OSINT_SOURCES, getEntityById, getSourceById } from "../lib/mockData";

function credColor(score) {
  if (score >= 75) return "text-accent-neon";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

export default function OsintIntelligence() {
  const [activeSourceId, setActiveSourceId] = useState(null);
  const [hoveredMentionId, setHoveredMentionId] = useState(null);

  const visibleMentions = activeSourceId
    ? OSINT_MENTIONS.filter((m) => m.sourceId === activeSourceId)
    : OSINT_MENTIONS;

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Mention feed */}
      <div className="glass-panel flex-1 p-6 overflow-y-auto">
        <div className="eyebrow mb-4 flex items-center gap-1.5">
          <Radar size={13} /> OSINT Mention Feed
        </div>
        <div className="flex flex-col gap-2">
          {visibleMentions.map((m) => {
            const entity = getEntityById(m.entityId);
            const source = getSourceById(m.sourceId);
            const isHovered = hoveredMentionId === m.id;
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMentionId(m.id)}
                onMouseLeave={() => setHoveredMentionId(null)}
                className={`border rounded-lg p-3 cursor-default transition-all duration-200 ${
                  isHovered
                    ? "border-accent-neon/50 bg-white/[0.03] shadow-[0_0_16px_-4px_rgba(0,255,180,0.25)] -translate-y-0.5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium">{entity?.label ?? "Unknown entity"}</span>
                  <span className="text-[10px] font-mono text-text-faint">
                    {new Date(m.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[12px] text-text-dim mb-2">{m.snippet}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`transition-colors ${
                      isHovered ? "text-text" : "text-text-faint"
                    }`}
                  >
                    {source?.name}
                  </span>
                  <span className="font-mono text-text-dim">Confidence {m.confidence}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source credibility panel */}
      <div className="glass-panel w-80 shrink-0 p-4 overflow-y-auto">
        <div className="eyebrow mb-3 flex items-center gap-1.5">
          <ShieldCheck size={13} /> Source Credibility
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setActiveSourceId(null)}
            className={`text-left px-3 py-2 rounded-lg text-[12px] border transition-all duration-200 active:scale-[0.98] ${
              activeSourceId === null
                ? "border-accent-neon text-accent-neon shadow-[0_0_12px_-4px_rgba(0,255,180,0.35)]"
                : "border-border text-text-dim hover:text-text hover:border-text-faint"
            }`}
          >
            All sources
          </button>
          {OSINT_SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSourceId(s.id === activeSourceId ? null : s.id)}
              className={`text-left px-3 py-2 rounded-lg border transition-all duration-200 active:scale-[0.98] ${
                activeSourceId === s.id
                  ? "border-accent-neon shadow-[0_0_12px_-4px_rgba(0,255,180,0.35)]"
                  : "border-border hover:border-text-faint hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px]">{s.name}</span>
                <span className={`text-[12px] font-mono ${credColor(s.credibility)}`}>
                  {s.credibility}
                </span>
              </div>
              <div className="text-[10px] text-text-faint mt-0.5">
                {s.recordsIndexed.toLocaleString()} records indexed
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}