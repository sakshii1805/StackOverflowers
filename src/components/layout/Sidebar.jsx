// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Share2,
  Map as MapIcon,
  FileSearch,
  AlertTriangle,
  Bell,
  Users,
  FolderKanban,
  FileText,
  Settings,
  Crosshair,
  Radio,
} from "lucide-react";
import { cn } from "../../lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/network", label: "Network Intelligence", icon: Share2 },
  { to: "/map", label: "Activity Map", icon: MapIcon },
  { to: "/osint", label: "OSINT Intelligence", icon: FileSearch },
  { to: "/anomalies", label: "Anomaly Detection", icon: AlertTriangle },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/entities", label: "Entities", icon: Users },
  { to: "/investigations", label: "Investigations", icon: FolderKanban },
  { to: "/reports", label: "Reports", icon: FileText },
];

const STATUS_ITEMS = [
  { label: "Intelligence Engine Online" },
  { label: "Data Pipeline Healthy" },
  { label: "ML Engine Ready" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-border flex flex-col px-3 py-5">
      <div className="flex items-center gap-2 px-2">
        <Crosshair size={19} className="text-accent-neon" />
        <span className="font-mono font-semibold text-[15px] tracking-wide">NARCOSCOPE</span>
      </div>
      <div className="px-2 mt-1 mb-4 text-[10.5px] font-mono text-text-faint">
        INTELLIGENCE CONSOLE
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors",
                isActive
                  ? "bg-accent-dim text-accent-neon"
                  : "text-text-dim hover:bg-surface-2 hover:text-text"
              )
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}

        <div className="my-2 border-t border-border" />

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors",
              isActive ? "bg-accent-dim text-accent-neon" : "text-text-dim hover:bg-surface-2 hover:text-text"
            )
          }
        >
          <Settings size={15} />
          Settings
        </NavLink>
      </nav>

      <div className="mt-auto pt-4 border-t border-border px-2">
        <div className="eyebrow mb-2">System Status</div>
        <div className="flex flex-col gap-1.5">
          {STATUS_ITEMS.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-[11px] text-text-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-neon animate-pulse-glow" />
              {s.label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-mono text-text-faint">
          <Radio size={10} />
          SYNTHETIC DATA · DEMO MODE
        </div>
      </div>
    </aside>
  );
}