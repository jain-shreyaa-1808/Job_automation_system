/**
 * Validates job listing links to ensure they point to active, specific openings
 * rather than generic career pages, 404s, or closed listings.
 */
export declare class JobLinkValidatorService {
    /** Patterns in final URLs that indicate a generic careers/search page rather than a specific opening */
    private static readonly GENERIC_PAGE_PATTERNS;
    /** Patterns in response body that indicate the job posting is closed or not found */
    private static readonly CLOSED_POSTING_PATTERNS;
    /**
     * Validate a single URL. Returns { valid, reason }.
     * Uses native fetch with a timeout and redirect tracking.
     */
    validateUrl(url: string): Promise<{
        valid: boolean;
        reason: string;
    }>;
    private loadUrl;
    private loadUrlWithFetch;
    private loadUrlWithCurl;
    private isLocalTlsFetchError;
    /**
     * Validate all unchecked or stale jobs for a given user.
     * Updates the DB records with linkStatus and linkCheckedAt.
     * Returns counts of valid/invalid jobs.
     */
    validateJobsForUser(userId: string): Promise<{
        total: number;
        valid: number;
        invalid: number;
    }>;
}
