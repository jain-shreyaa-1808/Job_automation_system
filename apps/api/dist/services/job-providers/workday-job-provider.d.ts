import type { JobProvider, JobProviderContext, ProviderJob } from "./types.js";
export declare class WorkdayJobProvider implements JobProvider {
    private readonly boardUrls;
    readonly sourceMode: "remote";
    private readonly platform;
    constructor(boardUrls: string[]);
    fetchJobs({ preferredRoles, profileSkills }: JobProviderContext): Promise<ProviderJob[]>;
    private parseBoardUrl;
    private mapJob;
    private getSearchRelevance;
    private formatCompanyName;
}
