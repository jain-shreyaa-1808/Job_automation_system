export type Job = {
  _id: string;
  title: string;
  company: string;
  description: string;
  link: string;
  platform: string;
  location: string;
  normalizedTitle?: string;
  extractedSkills: string[];
  categoryTags: string[];
  relevanceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  postedDate?: string;
  applicantCount?: number;
  experienceMin?: number;
  experienceMax?: number;
  status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
  linkStatus?: "valid" | "invalid" | "unchecked";
};

export type JobStatus = Job["status"];

export type DashboardResponse = {
  tabs: {
    newJobs: Job[];
    applied: Job[];
    inProgress: Job[];
    finished: Job[];
    bookmarked: Job[];
  };
  recruiterLeads: Array<{
    _id: string;
    name: string;
    title: string;
    company: string;
    state: "pending" | "action-taken" | "finished";
    recentPosts: string[];
  }>;
  resumeScore: number;
  skillGapRoadmap: string[];
  interviewQuestions: string[];
};
