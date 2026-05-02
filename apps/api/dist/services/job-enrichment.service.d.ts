type EnrichedJob = {
    normalizedTitle: string;
    extractedSkills: string[];
    categoryTags: string[];
};
export declare class JobEnrichmentService {
    enrich(job: {
        title: string;
        description: string;
    }): EnrichedJob;
    getCanonicalDedupKey(job: {
        title: string;
        company: string;
        location?: string;
    }): string;
    private normalizeTitle;
    private normalizeCompany;
    private normalizeLocation;
}
export {};
