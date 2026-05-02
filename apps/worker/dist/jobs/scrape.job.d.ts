import type { Job } from "bullmq";
import type { ScrapeJobPayload } from "@job-automation/shared";
export declare function handleScrape(job: Job<ScrapeJobPayload>): Promise<{
    refreshed: boolean;
    reason: string;
} | {
    fetchedPlatforms: string[];
    roles: string[];
    locations: string[];
    refreshed?: undefined;
    reason?: undefined;
}>;
