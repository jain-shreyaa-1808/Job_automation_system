type RankableJob = {
    relevanceScore?: number | null;
    postedDate?: Date | string | null;
    applicantCount?: number | null;
    createdAt?: Date | string | null;
};
export declare function getJobAgeInDays(postedDate?: Date | string | null): number;
export declare function isEarlyApplicantJob(job: RankableJob): boolean;
export declare function sortJobsByPriority<T extends RankableJob>(jobs: T[]): T[];
export {};
