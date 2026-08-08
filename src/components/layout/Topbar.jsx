// src/components/layout/Topbar.jsx
import { Activity } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-[19px] font-semibold">{title}</h1>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-dim border border-accent-neon/30 text-[10px] font-mono text-accent-neon">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-neon animate-pulse-glow" />
            DEMO MODE
          </span>
        </div>
        <p className="text-[12px] text-text-faint mt-1">
          {subtitle ?? "Narcotics network intelligence — synthetic demo environment"}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-text-faint">
        <Activity size={14} />
        LIVE FEED · SYNTHETIC
      </div>
    </div>
  );
}