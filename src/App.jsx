import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import NetworkIntelligence from "./pages/NetworkIntelligence";
import ActivityMap from "./pages/ActivityMap";
import OsintIntelligence from "./pages/OsintIntelligence";
import AnomalyDetection from "./pages/AnomalyDetection";
import Alerts from "./pages/Alerts";
import Entities from "./pages/Entities";
import Investigations from "./pages/Investigations";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";

function PageShell({ title, subtitle, children }) {
  return (
    <div className="flex-1 min-w-0 px-8 py-6 overflow-y-auto">
      <Topbar title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}

export default function App() {
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
                <SettingsPage />
              </PageShell>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}