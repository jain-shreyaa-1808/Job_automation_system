import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  autoApply,
  confirmApplication,
  fetchDashboard,
  fetchJobs,
  generateOutreach,
  generateResume,
  parseResume,
  triggerJobFetch,
  updateJobStatus,
  updateSettings,
  validateJobLinks,
} from "../lib/api";
import type { JobStatus } from "../types/app";
import { persistQueryData, readPersistedQuery } from "../lib/queryPersistence";

const QUERY_STALE_TIME = 5 * 60 * 1000;
const QUERY_GC_TIME = 24 * 60 * 60 * 1000;

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const data = await fetchDashboard();
      persistQueryData("dashboard", data);
      return data;
    },
    initialData: () => readPersistedQuery("dashboard"),
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
  });
}

export function useJobsQuery(status?: string, platform?: string) {
  const persistenceKey = `jobs:${status ?? "all"}:${platform ?? "all"}`;

  return useQuery({
    queryKey: ["jobs", status, platform],
    queryFn: async () => {
      const jobs = await fetchJobs(status, platform);
      persistQueryData(persistenceKey, jobs);
      return jobs;
    },
    initialData: () => readPersistedQuery(persistenceKey),
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
  });
}

export function useTriggerJobFetch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerJobFetch,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useValidateJobLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateJobLinks,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: JobStatus }) =>
      updateJobStatus(jobId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useGenerateResume() {
  return useMutation({
    mutationFn: generateResume,
  });
}

export function useGenerateOutreach() {
  return useMutation({
    mutationFn: generateOutreach,
  });
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: updateSettings,
  });
}

export function useParseResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: parseResume,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["resumeProfile"] });
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAutoApply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: autoApply,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useConfirmApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      applicationData,
    }: {
      jobId: string;
      applicationData: Record<string, unknown>;
    }) => confirmApplication(jobId, applicationData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
