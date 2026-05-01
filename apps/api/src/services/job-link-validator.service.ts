import { JobModel } from "../models/Job.js";

/**
 * Validates job listing links to ensure they point to active, specific openings
 * rather than generic career pages, 404s, or closed listings.
 */
export class JobLinkValidatorService {
  /** Patterns in final URLs that indicate a generic careers/search page rather than a specific opening */
  private static readonly GENERIC_PAGE_PATTERNS = [
    /\/search\??/i,
    /\/results\??/i,
    /\/joblist/i,
    /\/careers\/?$/i,
    /\/careers\/#/i,
    /\/jobs\/?$/i,
    /\/jobs\/#/i,
    /\/all-jobs/i,
    /\/job-search/i,
    /\/open-positions\/?$/i,
    /SearchJobs/i,
  ];

  /** Patterns in response body that indicate the job posting is closed or not found */
  private static readonly CLOSED_POSTING_PATTERNS = [
    /this (position|role|job) (has been|is) (filled|closed|removed)/i,
    /no longer (accepting|available|open)/i,
    /position (has been|is) (closed|filled)/i,
    /job (not found|does not exist|expired)/i,
    /this posting has expired/i,
    /the page you('re| are) looking for (was not|wasn't|cannot be) found/i,
    /404[\s\S]{0,20}not found/i,
    /we couldn'?t find/i,
    /this job is no longer available/i,
    /sorry.*?this (page|job|listing) (is|has)/i,
  ];

  /**
   * Validate a single URL. Returns { valid, reason }.
   * Uses native fetch with a timeout and redirect tracking.
   */
  async validateUrl(url: string): Promise<{ valid: boolean; reason: string }> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; JobPilot/1.0; link-checker)",
          Accept: "text/html,application/xhtml+xml,*/*",
        },
      });
      clearTimeout(timeout);

      // Check HTTP status
      if (response.status === 404 || response.status === 410) {
        return {
          valid: false,
          reason: `HTTP ${response.status} — page not found or removed`,
        };
      }
      if (response.status >= 400) {
        return {
          valid: false,
          reason: `HTTP ${response.status} — error response`,
        };
      }

      // Check if final URL is a generic careers/search page
      const finalUrl = response.url;
      const isGeneric = JobLinkValidatorService.GENERIC_PAGE_PATTERNS.some(
        (pattern) => pattern.test(finalUrl),
      );
      if (isGeneric) {
        return {
          valid: false,
          reason:
            "Redirects to a generic careers/search page, not a specific opening",
        };
      }

      // Sample the body for closed-posting signals (first 50KB)
      const body = await response.text();
      const sample = body.slice(0, 50_000);

      const closedMatch = JobLinkValidatorService.CLOSED_POSTING_PATTERNS.find(
        (pattern) => pattern.test(sample),
      );
      if (closedMatch) {
        return {
          valid: false,
          reason: "Job posting appears closed, filled, or expired",
        };
      }

      return {
        valid: true,
        reason: "Link is active and points to a specific job posting",
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return {
          valid: false,
          reason: "Request timed out — page may be unavailable",
        };
      }
      return {
        valid: false,
        reason: `Network error: ${err.message ?? "unable to reach page"}`,
      };
    }
  }

  /**
   * Validate all unchecked or stale jobs for a given user.
   * Updates the DB records with linkStatus and linkCheckedAt.
   * Returns counts of valid/invalid jobs.
   */
  async validateJobsForUser(userId: string) {
    const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // re-check after 24h

    const jobs = await JobModel.find({
      sourceUserId: userId,
      $or: [
        { linkStatus: "unchecked" },
        { linkStatus: { $exists: false } },
        { linkCheckedAt: { $lt: staleThreshold } },
      ],
    });

    let valid = 0;
    let invalid = 0;

    // Validate concurrently in batches of 5 to avoid hammering servers
    const BATCH_SIZE = 5;
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (job) => {
          const result = await this.validateUrl(job.link);
          await JobModel.updateOne(
            { _id: job._id },
            {
              linkStatus: result.valid ? "valid" : "invalid",
              linkCheckedAt: new Date(),
            },
          );
          return result.valid;
        }),
      );
      for (const r of results) {
        if (r.status === "fulfilled") {
          r.value ? valid++ : invalid++;
        } else {
          invalid++;
        }
      }
    }

    return { total: jobs.length, valid, invalid };
  }
}
