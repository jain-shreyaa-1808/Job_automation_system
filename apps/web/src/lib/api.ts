import axios from "axios";

import type {
  DashboardResponse,
  Job,
  JobStatus,
  RecruiterLead,
  RecruiterLeadState,
} from "../types/app";

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (import.meta.env.DEV && typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000/api/v1";
    }
  }

  return "/api/v1";
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, force re-login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export async function fetchDashboard() {
  const res = await api.get<DashboardResponse>("/dashboard");
  return res.data;
}

export async function fetchJobs(status?: string, platform?: string) {
  const res = await api.get<{ jobs: Job[] }>("/jobs", {
    params: {
      ...(status ? { status } : {}),
      ...(platform ? { platform } : {}),
    },
  });
  return res.data.jobs;
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const res = await api.patch<{ job: Job }>(`/jobs/${jobId}/status`, {
    status,
  });
  return res.data.job;
}

export async function triggerJobFetch() {
  const res = await api.post<{ jobs: Job[] }>("/jobs/fetch");
  return res.data.jobs;
}

export async function validateJobLinks() {
  const res = await api.post<{ total: number; valid: number; invalid: number }>(
    "/jobs/validate-links",
  );
  return res.data;
}

export async function generateResume(jobId: string) {
  const res = await api.post<{
    documentId: string;
    latex: string;
  }>("/resume/generate", { jobId });
  return res.data;
}

export async function generateOutreach(jobId: string) {
  const res = await api.post<{
    email: string;
    linkedinMessage: string;
    referralMessage: string;
  }>("/outreach/generate", { jobId });
  return res.data;
}

export async function generateOutreachForLead(
  jobId: string,
  recruiterLeadId?: string,
) {
  const res = await api.post<{
    email: string;
    linkedinMessage: string;
    referralMessage: string;
  }>("/outreach/generate", {
    jobId,
    ...(recruiterLeadId ? { recruiterLeadId } : {}),
  });
  return res.data;
}

export async function findHrLeads(jobId: string) {
  const res = await api.post<{ leads: RecruiterLead[] }>("/hr/find", { jobId });
  return res.data;
}

export async function updateHrLeadState(
  leadId: string,
  state: RecruiterLeadState,
) {
  const res = await api.patch<{ lead: RecruiterLead }>("/hr/state", {
    leadId,
    state,
  });
  return res.data.lead;
}

export async function updateSettings(payload: Record<string, unknown>) {
  const res = await api.put<{ user: Record<string, unknown> }>(
    "/settings",
    payload,
  );
  return res.data.user;
}

export async function parseResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await api.post("/parse-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function autoApply(jobId: string) {
  const res = await api.post("/apply/job", { jobId });
  return res.data;
}

export async function confirmApplication(
  jobId: string,
  applicationData: Record<string, unknown>,
) {
  const res = await api.post("/apply/confirm", { jobId, applicationData });
  return res.data;
}
