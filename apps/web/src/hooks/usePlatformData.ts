import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  autoApply,
  confirmApplication,
  fetchDashboard,
  fetchJobs,
  findHrLeads,
  findHrLeadsByDomain,
  generateOutreach,
  generateOutreachFromDescription,
  generateOutreachForLead,
  generateResume,
  parseResume,
  triggerJobFetch,
  updateHrLeadState,
  updateJobStatus,
  updateSettings,
  validateJobLinks,
} from "../lib/api";
import type {
  DashboardResponse,
  Job,
  JobStatus,
  RecruiterLeadState,
} from "../types/app";
import { persistQueryData, readPersistedQuery } from "../lib/queryPersistence";

const QUERY_STALE_TIME = 5 * 60 * 1000;
const QUERY_GC_TIME = 24 * 60 * 60 * 1000;
const LIVE_REFETCH_INTERVAL = 30 * 1000;

const dashboardStatusKeyMap: Record<
  JobStatus,
  keyof DashboardResponse["tabs"]
> = {
  new: "newJobs",
  applied: "applied",
  "in-progress": "inProgress",
  finished: "finished",
  bookmarked: "bookmarked",
  closed: "closed",
};

function mergeJobIntoDashboard(
  previous: DashboardResponse | undefined,
  updatedJob: Job,
) {
  if (!previous) {
    return previous;
  }

  const nextTabs = Object.fromEntries(
    Object.entries(previous.tabs).map(([key, jobs]) => [
      key,
      jobs.filter((job) => job._id !== updatedJob._id),
    ]),
  ) as DashboardResponse["tabs"];

  nextTabs[dashboardStatusKeyMap[updatedJob.status]] = [
    updatedJob,
    ...nextTabs[dashboardStatusKeyMap[updatedJob.status]],
  ];

  return {
    ...previous,
    tabs: nextTabs,
  };
}

function mergeJobIntoJobsList(
  previous: Job[] | undefined,
  updatedJob: Job,
  statusFilter?: string,
  platformFilter?: string,
) {
  if (!previous) {
    return previous;
  }

  const withoutJob = previous.filter((job) => job._id !== updatedJob._id);
  const matchesStatus = !statusFilter || updatedJob.status === statusFilter;
  const matchesPlatform =
    !platformFilter || updatedJob.platform === platformFilter;

  if (!matchesStatus || !matchesPlatform) {
    return withoutJob;
  }

  return [updatedJob, ...withoutJob];
}

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
    refetchInterval: LIVE_REFETCH_INTERVAL,
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
    refetchInterval: LIVE_REFETCH_INTERVAL,
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
    onMutate: async ({ jobId, status }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["jobs"] }),
        queryClient.cancelQueries({ queryKey: ["dashboard"] }),
      ]);

      const previousDashboard = queryClient.getQueryData<DashboardResponse>([
        "dashboard",
      ]);
      const previousJobQueries = queryClient.getQueriesData<Job[]>({
        queryKey: ["jobs"],
      });

      const currentJob = previousJobQueries
        .flatMap(([, jobs]) => jobs ?? [])
        .find((job) => job._id === jobId);

      if (!currentJob) {
        return { previousDashboard, previousJobQueries };
      }

      const updatedJob: Job = { ...currentJob, status };

      queryClient.setQueryData<DashboardResponse | undefined>(
        ["dashboard"],
        (previous) => mergeJobIntoDashboard(previous, updatedJob),
      );

      for (const [queryKey, jobs] of previousJobQueries) {
        const [, statusFilter, platformFilter] = queryKey as [
          string,
          string | undefined,
          string | undefined,
        ];

        queryClient.setQueryData<Job[] | undefined>(queryKey, (previous) =>
          mergeJobIntoJobsList(
            previous ?? jobs ?? undefined,
            updatedJob,
            statusFilter,
            platformFilter,
          ),
        );
      }

      return { previousDashboard, previousJobQueries };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(["dashboard"], context.previousDashboard);
      for (const [queryKey, jobs] of context.previousJobQueries) {
        queryClient.setQueryData(queryKey, jobs);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onSettled: () => {
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      recruiterLeadId,
    }: {
      jobId: string;
      recruiterLeadId?: string;
    }) => generateOutreachForLead(jobId, recruiterLeadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useGenerateOutreachFromDescription() {
  return useMutation({
    mutationFn: generateOutreachFromDescription,
  });
}

export function useFindHrLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: findHrLeads,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useFindHrLeadsByDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ domain, limit = 6 }: { domain: string; limit?: number }) =>
      findHrLeadsByDomain(domain, limit),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateHrLeadState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      state,
    }: {
      leadId: string;
      state: RecruiterLeadState;
    }) => updateHrLeadState(leadId, state),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
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
