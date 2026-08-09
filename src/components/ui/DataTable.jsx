import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/utils";

export default function DataTable({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search…",
  onRowClick,
  pageSize = 10,
  className,
}) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);

  // Filter
  const filtered = useMemo(() => {
    if (!search || !searchKey) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      const val = row[searchKey];
      return val && String(val).toLowerCase().includes(q);
    });
  }, [data, search, searchKey]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortCol] ?? "";
      const bVal = b[sortCol] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safetyPage = Math.min(page, totalPages - 1);
  const pageData = sorted.slice(safetyPage * pageSize, (safetyPage + 1) * pageSize);

  function handleSort(key) {
    if (sortCol === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }) {
    if (sortCol !== col) return <ChevronsUpDown size={12} className="text-text-faint" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-accent-neon" />
    ) : (
      <ChevronDown size={12} className="text-accent-neon" />
    );
  }

  return (
    <div className={cn("glass-panel overflow-hidden", className)}>
      {/* Search bar */}
      {searchKey && (
        <div className="px-4 py-3 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 bg-surface-2 border border-border rounded-lg text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent-neon/40 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={cn(
                    "px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-text-faint",
                    col.sortable !== false && "cursor-pointer hover:text-text-dim select-none"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable !== false && <SortIcon col={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-surface-2"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-text-dim">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-text-faint text-sm">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-[11px] text-text-faint font-mono">
            {sorted.length} result{sorted.length !== 1 ? "s" : ""} · Page {safetyPage + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safetyPage === 0}
              className="px-2.5 py-1 text-xs rounded-md bg-surface-2 text-text-dim hover:bg-accent-dim hover:text-accent-neon disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safetyPage >= totalPages - 1}
              className="px-2.5 py-1 text-xs rounded-md bg-surface-2 text-text-dim hover:bg-accent-dim hover:text-accent-neon disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
