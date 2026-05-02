import { env } from "../../config/env.js";
const DEFAULT_TARGET_SITES = [
    "indeed.com",
    "naukri.com",
    "foundit.in",
    "hirist.tech",
    "cutshort.io",
    "instahyre.com",
    "boards.greenhouse.io",
];
export class GoogleCseJobProvider {
    sourceMode = "remote";
    async fetchJobs({ preferredRoles, profileSkills, }) {
        if (!env.GOOGLE_CSE_API_KEY || !env.GOOGLE_CSE_ENGINE_ID) {
            return [];
        }
        const targetSites = (env.GOOGLE_CSE_TARGET_SITES ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
        const sites = targetSites.length > 0 ? targetSites : DEFAULT_TARGET_SITES;
        const query = this.buildQuery(preferredRoles, profileSkills, sites);
        const url = new URL("https://customsearch.googleapis.com/customsearch/v1");
        url.searchParams.set("key", env.GOOGLE_CSE_API_KEY);
        url.searchParams.set("cx", env.GOOGLE_CSE_ENGINE_ID);
        url.searchParams.set("q", query);
        url.searchParams.set("num", "10");
        const response = await fetch(url, {
            headers: { Accept: "application/json" },
        });
        if (!response.ok) {
            return [];
        }
        const payload = (await response.json());
        const jobs = (payload.items ?? []).map((item) => this.mapResult(item));
        return jobs.filter((job) => job !== null);
    }
    buildQuery(preferredRoles, profileSkills, sites) {
        const roleTerm = preferredRoles.find((role) => role.trim().length > 0) ??
            "software engineer";
        const skillTerm = profileSkills.slice(0, 3).join(" OR ");
        const siteQuery = sites.map((site) => `site:${site}`).join(" OR ");
        return `${roleTerm} remote jobs (${siteQuery}) ${skillTerm}`.trim();
    }
    mapResult(item) {
        if (!item.title || !item.link) {
            return null;
        }
        const cleanedTitle = item.title.replace(/\s*[-|].*$/, "").trim();
        const description = item.snippet?.trim() || cleanedTitle;
        const displayLink = item.displayLink?.trim() || new URL(item.link).hostname;
        const meta = item.pagemap?.metatags?.[0] ?? {};
        const location = meta["og:locality"] || meta["job_location"] || "Remote";
        return {
            title: cleanedTitle,
            company: this.inferCompany(displayLink),
            description,
            link: item.link,
            platform: "Google CSE",
            location,
            postedDate: new Date().toISOString(),
            applicantCount: 0,
            sourceMode: this.sourceMode,
        };
    }
    inferCompany(displayLink) {
        const hostname = displayLink.replace(/^www\./, "").split(".")[0] ?? displayLink;
        return hostname
            .split(/[-_]/)
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(" ");
    }
}
//# sourceMappingURL=google-cse-job-provider.js.map