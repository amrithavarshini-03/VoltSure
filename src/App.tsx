import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell';
import { DashboardPlanner } from './pages/DashboardPlanner';
import { ProofDashboard } from './pages/ProofDashboard';
import { LiveDriveMode } from './pages/LiveDriveMode';
import { ChargerTrust } from './pages/ChargerTrust';
import { ModelEvidence } from './pages/ModelEvidence';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<DashboardPlanner />} />
          <Route path="proof" element={<ProofDashboard />} />
          <Route path="drive" element={<LiveDriveMode />} />
          <Route path="chargers" element={<ChargerTrust />} />
          <Route path="evidence" element={<ModelEvidence />} />
          {/* Legacy redirects for quick access */}
          <Route path="setup" element={<Navigate to="/" replace />} />
          <Route path="replan" element={<Navigate to="/drive" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
