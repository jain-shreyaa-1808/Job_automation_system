import type { JobProvider, JobProviderContext, ProviderJob } from "./types.js";
type SiteKey = "cutshort" | "foundit" | "hirist" | "indeed" | "instahyre" | "myjobai" | "naukri";
export type SupportedPublicScrapeSite = SiteKey;
export declare class PublicHtmlJobProvider implements JobProvider {
    private readonly siteKeys;
    readonly sourceMode: "remote";
    constructor(siteKeys: string[]);
    fetchJobs(context: JobProviderContext): Promise<ProviderJob[]>;
    private fetchSite;
    private fetchDuckDuckGoFallback;
    private parseJobsForSite;
    private parseWithHeuristics;
    private buildSearchQuery;
    private normalizeDuckDuckGoLink;
    private inferCompanyFromTitle;
    private extractLocation;
    private getSearchRelevance;
    private firstText;
    private firstAttr;
    private toAbsoluteUrl;
    private loadHtml;
    private isLocalTlsFetchError;
}
export declare function getPublicScrapeUrls(siteKey: SupportedPublicScrapeSite, preferredRole: string, pageCount?: number): string[];
export declare function parseJobsFromHtml(siteKey: SupportedPublicScrapeSite, html: string, url: string): ProviderJob[];
export {};
