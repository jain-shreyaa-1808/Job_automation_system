import axios from "axios";

import type { DashboardResponse, Job } from "../types/app";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1",
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

export async function fetchJobs(status?: string) {
  const res = await api.get<{ jobs: Job[] }>("/jobs", {
    params: status ? { status } : undefined,
  });
  return res.data.jobs;
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
    atsSuggestions: string[];
    atsKeywordsInjected: string[];
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
