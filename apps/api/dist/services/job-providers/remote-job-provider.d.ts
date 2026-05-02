import type { JobProvider, JobProviderContext, ProviderJob } from "./types.js";
export declare class RemoteJobProvider implements JobProvider {
    readonly sourceMode: "remote";
    fetchJobs({ preferredRoles, profileSkills }: JobProviderContext): Promise<ProviderJob[]>;
    private fetchCustomFeed;
    private fetchRemoteOkJobs;
    private loadRemoteOkPayload;
    private mapRemoteOkJob;
    private getSearchRelevance;
    private normalizeTerms;
    private isLocalTlsFetchError;
    private normalizeDescription;
}
