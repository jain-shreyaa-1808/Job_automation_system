export type Job = {
  _id: string;
  title: string;
  company: string;
  description: string;
  link: string;
  platform: string;
  location: string;
  relevanceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
};

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
