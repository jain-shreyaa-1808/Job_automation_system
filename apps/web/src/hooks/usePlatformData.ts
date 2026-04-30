import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  autoApply,
  fetchDashboard,
  fetchJobs,
  generateOutreach,
  generateResume,
  parseResume,
  triggerJobFetch,
  updateSettings,
} from "../lib/api";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });
}

export function useJobsQuery(status?: string) {
  return useQuery({
    queryKey: ["jobs", status],
    queryFn: () => fetchJobs(status),
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
  return useMutation({
    mutationFn: parseResume,
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
