import { env } from "../../config/env.js";
import { JobEnrichmentService } from "../job-enrichment.service.js";
import { GoogleCseJobProvider } from "./google-cse-job-provider.js";
import { GreenhouseJobProvider } from "./greenhouse-job-provider.js";
import { PublicHtmlJobProvider } from "./public-html-job-provider.js";
import { RemoteJobProvider } from "./remote-job-provider.js";
import { WorkdayJobProvider } from "./workday-job-provider.js";
export class MultiSourceJobProvider {
    sourceMode = "remote";
    enrichment = new JobEnrichmentService();
    providers = this.buildProviders();
    async fetchJobs(context) {
        const results = await Promise.allSettled(this.providers.map((provider) => provider.fetchJobs(context)));
        const merged = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
        const deduped = new Map();
        for (const job of merged) {
            const key = this.enrichment.getCanonicalDedupKey(job);
            const existing = deduped.get(key);
            if (!existing) {
                deduped.set(key, job);
                continue;
            }
            const existingTime = new Date(existing.postedDate).getTime();
            const currentTime = new Date(job.postedDate).getTime();
            if (currentTime > existingTime) {
                deduped.set(key, job);
            }
        }
        return [...deduped.values()];
    }
    buildProviders() {
        const providers = [
            new RemoteJobProvider(),
        ];
        const greenhouseBoardTokens = (env.GREENHOUSE_BOARD_TOKENS ?? "")
            .split(",")
            .map((token) => token.trim())
            .filter(Boolean);
        if (greenhouseBoardTokens.length > 0) {
            providers.push(new GreenhouseJobProvider(greenhouseBoardTokens));
        }
        const workdayBoardUrls = (env.WORKDAY_BOARD_URLS ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
        if (workdayBoardUrls.length > 0) {
            providers.push(new WorkdayJobProvider(workdayBoardUrls));
        }
        if (env.GOOGLE_CSE_API_KEY && env.GOOGLE_CSE_ENGINE_ID) {
            providers.push(new GoogleCseJobProvider());
        }
        const publicScrapeSources = (env.PUBLIC_JOB_SCRAPE_SOURCES ?? "")
            .split(",")
            .map((source) => source.trim().toLowerCase())
            .filter(Boolean);
        if (publicScrapeSources.length > 0) {
            providers.push(new PublicHtmlJobProvider(publicScrapeSources));
        }
        return providers;
    }
}
//# sourceMappingURL=multi-source-job-provider.js.map