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
  status:
    | "new"
    | "applied"
    | "in-progress"
    | "finished"
    | "bookmarked"
    | "closed";
  linkStatus?: "valid" | "invalid" | "unchecked";
};

export type JobStatus = Job["status"];

export type RecruiterLeadState = "pending" | "action-taken" | "finished";

export type RecruiterLead = {
  _id: string;
  jobId: string;
  name: string;
  title: string;
  company: string;
  category: "hr" | "talent-acquisition" | "hiring-manager" | "referral";
  profileUrl?: string;
  searchUrl?: string;
  searchQuery?: string;
  hiringSignal?: string;
  state: RecruiterLeadState;
  recentPosts: string[];
};

export type DashboardResponse = {
  tabs: {
    newJobs: Job[];
    applied: Job[];
    inProgress: Job[];
    finished: Job[];
    bookmarked: Job[];
    closed: Job[];
  };
  recruiterLeads: RecruiterLead[];
  resumeScore: number;
  skillGapRoadmap: string[];
  interviewQuestions: string[];
};
