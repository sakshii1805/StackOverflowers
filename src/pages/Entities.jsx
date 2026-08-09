// src/pages/Entities.jsx
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import {
  ENTITIES,
  getSectorById,
  getRelationshipsForEntity,
  getOsintMentionsForEntity,
} from "../lib/mockData";

const TYPES = ["person", "vehicle", "location", "shipment", "organization"];

const SORT_OPTIONS = [
  { key: "risk", label: "Risk Indicator" },
  { key: "connections", label: "Connections" },
];

function riskTier(score) {
  if (score >= 80) return { bar: "bg-red-400", text: "text-red-400" };
  if (score >= 50) return { bar: "bg-amber-400", text: "text-amber-400" };
  return { bar: "bg-accent-neon", text: "text-accent-neon" };
}

export default function Entities() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [sortKey, setSortKey] = useState("risk");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    let list = ENTITIES;
    if (typeFilter) list = list.filter((e) => e.type === typeFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) => e.label.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) =>
      sortKey === "risk" ? b.riskIndicator - a.riskIndicator : b.connections - a.connections
    );
    return sorted;
  }, [query, typeFilter, sortKey]);

  const selected = ENTITIES.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Main table */}
      <div className="glass-panel flex-1 p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="eyebrow flex items-center gap-1.5">
            <Users size={13} /> Entities
          </div>
          <span className="text-[11px] text-text-faint font-mono">
            {filtered.length} of {ENTITIES.length}
          </span>
        </div>

        {/* Controls - search gets its own row, breathing room from filters */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
            <Search size={13} className="text-text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or ID…"
              className="bg-transparent outline-none text-[12px] flex-1 text-text placeholder:text-text-faint"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTypeFilter(null)}
                className={`text-[11px] px-3 py-1.5 rounded-full border capitalize transition-colors ${
                  typeFilter === null
                    ? "border-accent-neon text-accent-neon bg-accent-dim"
                    : "border-border text-text-dim hover:text-text hover:border-text-faint"
                }`}
              >
                All
              </button>
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t === typeFilter ? null : t)}
                  className={`text-[11px] px-3 py-1.5 rounded-full border capitalize transition-colors ${
                    typeFilter === t
                      ? "border-accent-neon text-accent-neon bg-accent-dim"
                      : "border-border text-text-dim hover:text-text hover:border-text-faint"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="text-[11px] bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-text-dim outline-none shrink-0"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto">
          <table className="w-full text-[12px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-text-faint sticky top-0 bg-surface z-10">
                <th className="pb-3 pr-4 font-normal border-b border-border">Label</th>
                <th className="pb-3 pr-4 font-normal border-b border-border">Type</th>
                <th className="pb-3 pr-4 font-normal border-b border-border">Sector</th>
                <th className="pb-3 pr-4 font-normal border-b border-border">Risk</th>
                <th className="pb-3 font-normal border-b border-border">Connections</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const sector = getSectorById(e.sectorId);
                const isSelected = e.id === selectedId;
                const risk = riskTier(e.riskIndicator);
                return (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedId(isSelected ? null : e.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-accent-dim" : "hover:bg-surface-2"
                    }`}
                  >
                    <td className="py-3 pr-4 border-b border-border/40">{e.label}</td>
                    <td className="py-3 pr-4 capitalize text-text-dim border-b border-border/40">
                      {e.type}
                    </td>
                    <td className="py-3 pr-4 text-text-dim border-b border-border/40">
                      {sector?.id}
                    </td>
                    <td className="py-3 pr-4 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-1 rounded-full bg-white/10 overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${risk.bar}`}
                            style={{ width: `${e.riskIndicator}%` }}
                          />
                        </div>
                        <span className={`font-mono ${risk.text}`}>{e.riskIndicator}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono border-b border-border/40">{e.connections}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-faint">
                    No entities match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail side panel */}
      <div className="glass-panel w-80 shrink-0 p-4 overflow-y-auto">
        <div className="eyebrow mb-3">Entity Details</div>
        {selected ? (
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[15px] font-semibold">{selected.label}</div>
              <div className="text-[11px] text-text-faint capitalize">{selected.type}</div>
            </div>

            <div className="flex flex-col gap-1.5 text-[12px]">
              <Row label="ID" value={selected.id} />
              <Row label="Sector" value={selected.sectorId} />
              <Row label="Risk Indicator" value={`${selected.riskIndicator}%`} />
              <Row label="Connections" value={selected.connections} />
              <Row label="Locations" value={selected.locations} />
              <Row label="Events" value={selected.events} />
              <Row label="First Seen" value={selected.createdAt} />
            </div>

            <div>
              <div className="eyebrow mb-2">Relationships</div>
              <div className="flex flex-col gap-1">
                {getRelationshipsForEntity(selected.id).slice(0, 6).map((r) => (
                  <div key={r.id} className="text-[11px] text-text-dim">
                    {r.label} → {r.source === selected.id ? r.target : r.source}
                  </div>
                ))}
                {getRelationshipsForEntity(selected.id).length === 0 && (
                  <p className="text-[11px] text-text-faint">No relationships recorded.</p>
                )}
              </div>
            </div>

            <div>
              <div className="eyebrow mb-2">OSINT Mentions</div>
              <div className="flex flex-col gap-1">
                {getOsintMentionsForEntity(selected.id).slice(0, 3).map((m) => (
                  <div key={m.id} className="text-[11px] text-text-dim">
                    {m.snippet}
                  </div>
                ))}
                {getOsintMentionsForEntity(selected.id).length === 0 && (
                  <p className="text-[11px] text-text-faint">No OSINT mentions found.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-40 gap-2">
            <Users size={20} className="text-text-faint" />
            <p className="text-text-dim text-[12px]">Click a row to view entity details.</p>
          </div>
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