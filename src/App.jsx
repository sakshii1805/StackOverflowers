import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import { runIngestion } from "./lib/api";

import Dashboard from "./pages/Dashboard";
import NetworkIntelligence from "./pages/NetworkIntelligence";
import ActivityMap from "./pages/ActivityMap";
import OsintIntelligence from "./pages/OsintIntelligence";
import AnomalyDetection from "./pages/AnomalyDetection";
import Alerts from "./pages/Alerts";
import Entities from "./pages/Entities";
import Investigations from "./pages/Investigations";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function PageShell({ title, subtitle, children }) {
  return (
    <div className="flex-1 min-w-0 px-8 py-6 overflow-y-auto">
      <Topbar title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const getIntervalMs = () => {
      const rate = localStorage.getItem("narcoscope_refresh_rate") || "30 seconds";
      switch (rate) {
        case "Real-time":
          return 10000;
        case "30 seconds":
          return 30000;
        case "1 minute":
          return 60000;
        case "5 minutes":
          return 300000;
        default:
          return 30000;
      }
    };

    let timer = setInterval(() => {
      runIngestion();
    }, getIntervalMs());

    const handleSettingsUpdate = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        runIngestion();
      }, getIntervalMs());
    };

    window.addEventListener("narcoscope_settings_updated", handleSettingsUpdate);
    return () => {
      clearInterval(timer);
      window.removeEventListener("narcoscope_settings_updated", handleSettingsUpdate);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bg text-text">
        <Sidebar />
        <Routes>
          <Route
            path="/"
            element={
              <PageShell title="Dashboard">
                <Dashboard />
              </PageShell>
            }
          />
          <Route
            path="/network"
            element={
              <PageShell title="Network Intelligence">
                <NetworkIntelligence />
              </PageShell>
            }
          />
          <Route
            path="/map"
            element={
              <PageShell title="Activity Map">
                <ActivityMap />
              </PageShell>
            }
          />
          <Route
            path="/osint"
            element={
              <PageShell title="OSINT Intelligence">
                <OsintIntelligence />
              </PageShell>
            }
          />
          <Route
            path="/anomalies"
            element={
              <PageShell title="Anomaly Detection">
                <AnomalyDetection />
              </PageShell>
            }
          />
          <Route
            path="/alerts"
            element={
              <PageShell title="Alerts">
                <Alerts />
              </PageShell>
            }
          />
          <Route
            path="/entities"
            element={
              <PageShell title="Entities">
                <Entities />
              </PageShell>
            }
          />
          <Route
            path="/investigations"
            element={
              <PageShell title="Investigations">
                <Investigations />
              </PageShell>
            }
          />
          <Route
            path="/reports"
            element={
              <PageShell title="Reports">
                <Reports />
              </PageShell>
            }
          />
          <Route
            path="/settings"
            element={
              <PageShell title="Settings">
                <Settings />
              </PageShell>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}