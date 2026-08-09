import { useState, useEffect } from "react";
import { FileText, Printer, Download, FileSpreadsheet } from "lucide-react";
import { getDashboardSummary, getReports } from "../lib/api";
import {
  DATASET_SUMMARY,
  SECTORS,
  ANOMALIES,
  ALERTS,
  INVESTIGATIONS,
} from "../lib/mockData";

const SUMMARY_ROWS = [
  { key: "totalEntities", label: "Total Entities" },
  { key: "totalRelationships", label: "Total Relationships" },
  { key: "totalSectors", label: "Sectors Monitored" },
  { key: "totalAlerts", label: "Alerts Generated" },
  { key: "activeInvestigations", label: "Active Investigations" },
  { key: "totalAnomalies", label: "Anomalies Detected" },
];

export default function Reports() {
  const [summary, setSummary] = useState(DATASET_SUMMARY);

  const fetchSummary = () => {
    getDashboardSummary().then((data) => {
      if (data && data.stats) setSummary(data.stats);
    });
  };

  useEffect(() => {
    fetchSummary();
    window.addEventListener("narcoscope_data_updated", fetchSummary);
    return () => {
      window.removeEventListener("narcoscope_data_updated", fetchSummary);
    };
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleExportCSV = () => {
    let csv = "NARCOSCOPE INTELLIGENCE SUMMARY REPORT\n";
    csv += `Generated Date,${new Date().toISOString()}\n\n`;
    csv += "DATASET OVERVIEW\nMetric,Value\n";
    SUMMARY_ROWS.forEach((row) => {
      csv += `"${row.label}",${summary?.[row.key] ?? 0}\n`;
    });
    csv += "\nSECTOR BREAKDOWN\nSector Name,Baseline,Current Activity,Anomaly Score,Status\n";
    SECTORS.forEach((s) => {
      csv += `"${s.name}",${s.baseline},${s.activityCount},${Math.round(s.anomalyScore * 100)}%,"${s.anomalyScore >= 0.2 ? "FLAGGED" : "NORMAL"}"\n`;
    });
    csv += "\nTOP ANOMALIES\nLabel,Deviation Percentage\n";
    ANOMALIES.forEach((a) => {
      csv += `"${a.label}",+${a.deviationPct}%\n`;
    });
    csv += "\nACTIVE INVESTIGATIONS\nTitle,Status,Lead Analyst\n";
    INVESTIGATIONS.forEach((inv) => {
      csv += `"${inv.title}","${inv.status}","${inv.leadAnalyst || "V. Vance"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `narcoscope_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const reportData = {
      title: "NARCOSCOPE Intelligence Summary Report",
      generatedAt: new Date().toISOString(),
      datasetOverview: summary,
      sectorBreakdown: SECTORS,
      anomalies: ANOMALIES,
      alerts: ALERTS,
      investigations: INVESTIGATIONS,
    };
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `narcoscope_report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header / export action */}
      <div className="glass-panel p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-1 flex items-center gap-1.5">
            <FileText size={13} /> Intelligence Summary Report
          </div>
          <p className="text-[12px] text-text-faint">Generated {today} · Synthetic demo dataset</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg bg-accent-neon/10 border border-accent-neon/40 text-accent-neon hover:bg-accent-neon/20 transition-colors font-medium"
          >
            <FileSpreadsheet size={13} />
            Export CSV Data
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg border border-border text-text-dim hover:text-text hover:border-text-faint transition-colors"
          >
            <Download size={13} />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg border border-border text-text-dim hover:text-text hover:border-text-faint transition-colors"
          >
            <Printer size={13} />
            Print Page
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="glass-panel p-6">
        <div className="eyebrow mb-4">Dataset Overview</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SUMMARY_ROWS.map((row) => (
            <div key={row.key} className="flex flex-col gap-1">
              <span className="text-[11px] text-text-faint">{row.label}</span>
              <span className="text-xl font-semibold">{summary?.[row.key] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sector breakdown */}
      <div className="glass-panel p-6 overflow-x-auto">
        <div className="eyebrow mb-4">Sector Breakdown</div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-text-faint border-b border-border">
              <th className="pb-2 pr-4 font-normal">Sector</th>
              <th className="pb-2 pr-4 font-normal">Baseline</th>
              <th className="pb-2 pr-4 font-normal">Current Activity</th>
              <th className="pb-2 pr-4 font-normal">Anomaly Score</th>
              <th className="pb-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {SECTORS.map((s) => {
              const flagged = s.anomalyScore >= 0.2;
              return (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-2 pr-4">{s.name}</td>
                  <td className="py-2 pr-4 font-mono">{s.baseline}</td>
                  <td className="py-2 pr-4 font-mono">{s.activityCount}</td>
                  <td className="py-2 pr-4 font-mono">{Math.round(s.anomalyScore * 100)}%</td>
                  <td className="py-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        flagged
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-surface-2 text-text-faint border-border"
                      }`}
                    >
                      {flagged ? "Flagged" : "Normal"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Anomalies + Alerts + Investigations summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5">
          <div className="eyebrow mb-3">Top Anomalies</div>
          <div className="flex flex-col gap-2">
            {ANOMALIES.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-[12px]">
                <span className="text-text-dim">{a.label}</span>
                <span className="font-mono text-text-faint">+{a.deviationPct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="eyebrow mb-3">Alert Status Breakdown</div>
          <div className="flex flex-col gap-2">
            {["new", "investigating", "resolved"].map((status) => (
              <div key={status} className="flex items-center justify-between text-[12px] capitalize">
                <span className="text-text-dim">{status}</span>
                <span className="font-mono text-text-faint">
                  {ALERTS.filter((a) => a.status === status).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="eyebrow mb-3">Investigations</div>
          <div className="flex flex-col gap-2">
            {INVESTIGATIONS.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-[12px]">
                <span className="text-text-dim truncate pr-2">{inv.title}</span>
                <span className="font-mono text-text-faint capitalize shrink-0">{inv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}