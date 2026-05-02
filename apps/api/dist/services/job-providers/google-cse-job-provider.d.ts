import type { JobProvider, JobProviderContext, ProviderJob } from "./types.js";
export declare class GoogleCseJobProvider implements JobProvider {
    readonly sourceMode: "remote";
    fetchJobs({ preferredRoles, profileSkills, }: JobProviderContext): Promise<ProviderJob[]>;
    private buildQuery;
    private mapResult;
    private inferCompany;
}
