import { Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { HROutreachPage } from "./pages/HROutreachPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { JobListingsPage } from "./pages/JobListingsPage";
import { ResumeOptimizerPage } from "./pages/ResumeOptimizerPage";
import { ResumeUploadPage } from "./pages/ResumeUploadPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobListingsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/resume" element={<ResumeUploadPage />} />
        <Route path="/optimizer" element={<ResumeOptimizerPage />} />
        <Route path="/outreach" element={<HROutreachPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
