export type JobSourceMode = "mock" | "remote";

export type ProviderJob = {
  title: string;
  company: string;
  description: string;
  link: string;
  platform: string;
  location: string;
  postedDate: string;
  applicantCount: number;
  experienceMin?: number;
  experienceMax?: number;
  sourceMode: JobSourceMode;
};

export type JobProviderContext = {
  preferredRoles: string[];
  profileSkills: string[];
};

export interface JobProvider {
  readonly sourceMode: JobSourceMode;
  fetchJobs(context: JobProviderContext): Promise<ProviderJob[]>;
}
