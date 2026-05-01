import type { Job } from "bullmq";
import type { ScrapeJobPayload } from "@job-automation/shared";
export declare function handleScrape(job: Job<ScrapeJobPayload>): Promise<{
    fetchedPlatforms: string[];
    roles: string[];
    locations: string[];
    message: string;
}>;
