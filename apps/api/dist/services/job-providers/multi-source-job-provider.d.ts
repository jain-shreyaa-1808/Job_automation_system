import type { JobProvider, JobProviderContext, ProviderJob } from "./types.js";
export declare class MultiSourceJobProvider implements JobProvider {
    readonly sourceMode: "remote";
    private readonly enrichment;
    private readonly providers;
    fetchJobs(context: JobProviderContext): Promise<ProviderJob[]>;
    private buildProviders;
}
