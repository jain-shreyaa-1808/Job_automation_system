import { logger } from "../lib/logger.js";
export async function handleScrape(job) {
    logger.info({ payload: job.data }, "Processing scrape job");
    return {
        fetchedPlatforms: job.data.targetPlatforms,
        roles: job.data.preferredRoles,
        locations: job.data.preferredLocations,
        message: "Scrape job prepared. Provider-specific fetchers can be added per platform adapter.",
    };
}
//# sourceMappingURL=scrape.job.js.map