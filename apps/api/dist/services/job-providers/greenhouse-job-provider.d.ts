import type { JobProviderContext, ProviderJob } from "./types.js";
export declare class GreenhouseJobProvider {
    private readonly boardTokens;
    readonly platform = "Greenhouse";
    constructor(boardTokens: string[]);
    fetchJobs({ preferredRoles, profileSkills }: JobProviderContext): Promise<ProviderJob[]>;
    private mapJob;
    private getSearchRelevance;
    private formatBoardName;
    private normalizeDescription;
}
