import type { JobProvider, JobProviderContext, ProviderJob } from "./types.js";
export declare class MockJobProvider implements JobProvider {
    readonly sourceMode: "mock";
    fetchJobs({ preferredRoles, }: JobProviderContext): Promise<ProviderJob[]>;
}
