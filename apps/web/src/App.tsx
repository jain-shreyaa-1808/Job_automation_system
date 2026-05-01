import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import { AutoApplyPage } from "./pages/AutoApplyPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HROutreachPage } from "./pages/HROutreachPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { JobListingsPage } from "./pages/JobListingsPage";
import { LoginPage } from "./pages/LoginPage";
import { ResumeOptimizerPage } from "./pages/ResumeOptimizerPage";
import { ResumeUploadPage } from "./pages/ResumeUploadPage";
import { SettingsPage } from "./pages/SettingsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobListingsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/resume" element={<ResumeUploadPage />} />
        <Route path="/optimizer" element={<ResumeOptimizerPage />} />
        <Route path="/outreach" element={<HROutreachPage />} />
        <Route path="/auto-apply" element={<AutoApplyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
