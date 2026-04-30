import axios from "axios";

import type { DashboardResponse, Job } from "../types/app";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1",
});

const fallbackJobs: Job[] = [
  {
    _id: "job-1",
    title: "Software Engineer I",
    company: "Acme Cloud",
    description:
      "Build product features using React, Node.js, MongoDB, and CI/CD pipelines.",
    link: "https://careers.example.com/jobs/software-engineer-i",
    platform: "Direct Careers",
    location: "Bengaluru",
    relevanceScore: 86,
    matchedSkills: ["react", "node.js", "mongodb"],
    missingSkills: ["docker"],
    status: "new",
  },
  {
    _id: "job-2",
    title: "Wireless TAC Engineer",
    company: "NetWave Systems",
    description:
      "Troubleshoot enterprise wireless incidents, logs, Cisco gear, and customer escalations.",
    link: "https://jobs.example.com/netwave/wireless-tac-engineer",
    platform: "Foundit",
    location: "Remote",
    relevanceScore: 79,
    matchedSkills: ["networking", "wireless", "cisco"],
    missingSkills: ["linux"],
    status: "in-progress",
  },
];

const fallbackDashboard: DashboardResponse = {
  tabs: {
    newJobs: [fallbackJobs[0]],
    applied: [],
    inProgress: [fallbackJobs[1]],
    finished: [],
    bookmarked: [],
  },
  recruiterLeads: [
    {
      _id: "lead-1",
      name: "Acme Cloud Recruiting Team",
      title: "Talent Acquisition",
      company: "Acme Cloud",
      state: "pending",
      recentPosts: [
        "Hiring graduate engineers for cloud platform teams.",
        "Looking for candidates who can communicate clearly under pressure.",
      ],
    },
  ],
  resumeScore: 84,
  skillGapRoadmap: ["docker", "linux", "incident response"],
  interviewQuestions: [
    "How would you debug a flaky wireless connection in production?",
    "What tradeoffs would you consider in a Node.js API that serves thousands of requests per minute?",
  ],
};

function withFallback<T>(promise: Promise<T>, fallback: T) {
  return promise.catch(() => fallback);
}

export async function fetchDashboard() {
  const response = await withFallback(
    api.get<DashboardResponse>("/dashboard"),
    { data: fallbackDashboard } as { data: DashboardResponse },
  );
  return response.data;
}

export async function fetchJobs(status?: string) {
  const response = await withFallback(
    api.get<{ jobs: Job[] }>("/jobs", {
      params: status ? { status } : undefined,
    }),
    { data: { jobs: fallbackJobs } } as { data: { jobs: Job[] } },
  );
  return response.data.jobs;
}

export async function triggerJobFetch() {
  const response = await withFallback(
    api.post<{ jobs: Job[] }>("/jobs/fetch"),
    { data: { jobs: fallbackJobs } } as { data: { jobs: Job[] } },
  );
  return response.data.jobs;
}

export async function generateResume(jobId: string) {
  const response = await withFallback(
    api.post<{ latex: string; atsSuggestions: string[]; downloadUrl: string }>(
      "/resume/generate",
      { jobId },
    ),
    {
      data: {
        latex:
          "\\documentclass{article}\\begin{document}Sample Resume\\end{document}",
        atsSuggestions: [
          "Mirror the job title in your summary.",
          "Quantify your top project outcome.",
        ],
        downloadUrl: "/generated/sample.pdf",
      },
    } as {
      data: { latex: string; atsSuggestions: string[]; downloadUrl: string };
    },
  );
  return response.data;
}

export async function generateOutreach(jobId: string) {
  const response = await withFallback(
    api.post<{ email: string; linkedinMessage: string }>("/outreach/generate", {
      jobId,
    }),
    {
      data: {
        email:
          "Subject: Interest in the role\n\nHi Hiring Team,\nI would love to discuss the opportunity.",
        linkedinMessage:
          "Hi, I am interested in the role and would value a connection.",
      },
    } as { data: { email: string; linkedinMessage: string } },
  );
  return response.data;
}

export async function updateSettings(payload: Record<string, unknown>) {
  const response = await withFallback(
    api.put<{ user: Record<string, unknown> }>("/settings", payload),
    { data: { user: payload } } as { data: { user: Record<string, unknown> } },
  );
  return response.data.user;
}

export async function parseResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await withFallback(
    api.post("/parse-resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
    {
      data: {
        name: "Aarav Sharma",
        skills: ["react", "typescript", "node.js", "networking"],
        projects: [],
        experience: [],
        education: [],
        certifications: [],
        parsedText: "Sample parsed text",
      },
    } as { data: Record<string, unknown> },
  );

  return response.data;
}
