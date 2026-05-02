import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { load } from "cheerio";
import { env } from "../../config/env.js";
const execFileAsync = promisify(execFile);
const DEFAULT_QUERY = "software engineer";
const DEFAULT_LOCATION = "Remote";
const MAX_PROVIDER_RESULTS = 25;
const DEFAULT_HEADERS = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};
export class PublicHtmlJobProvider {
    siteKeys;
    sourceMode = "remote";
    constructor(siteKeys) {
        this.siteKeys = siteKeys;
    }
    async fetchJobs(context) {
        const query = this.buildSearchQuery(context.preferredRoles);
        const enabledSites = SITE_CONFIGS.filter((site) => this.siteKeys.includes(site.key));
        const results = await Promise.allSettled(enabledSites.map((site) => this.fetchSite(site, query, context)));
        return results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    }
    async fetchSite(site, query, { preferredRoles, profileSkills }) {
        const urls = site.buildUrls(query, env.PUBLIC_JOB_SCRAPE_PAGES);
        if (urls.length === 0) {
            return [];
        }
        try {
            const pages = await Promise.all(urls.map(async (url) => {
                const html = await this.loadHtml(url);
                return this.parseJobsForSite(site.key, html, url);
            }));
            const deduped = new Map();
            for (const job of pages.flat()) {
                deduped.set(job.link, job);
            }
            const jobs = [...deduped.values()];
            const fallbackJobs = jobs.length === 0 ? await this.fetchDuckDuckGoFallback(site, query) : [];
            const combinedJobs = jobs.length > 0 ? jobs : fallbackJobs;
            return combinedJobs
                .map((job) => ({
                job,
                relevance: this.getSearchRelevance(job, preferredRoles, profileSkills),
            }))
                .filter(({ relevance }) => relevance > 0)
                .sort((left, right) => right.relevance - left.relevance)
                .slice(0, MAX_PROVIDER_RESULTS)
                .map(({ job }) => job);
        }
        catch {
            return [];
        }
    }
    async fetchDuckDuckGoFallback(site, query) {
        const searchQuery = `${site.searchDomains
            .map((domain) => `site:${domain}`)
            .join(" OR ")} ${query} remote jobs`;
        const url = new URL("https://html.duckduckgo.com/html/");
        url.searchParams.set("q", searchQuery);
        try {
            const html = await this.loadHtml(url.toString());
            const $ = load(html);
            const jobs = [];
            $(".result").each((_, element) => {
                const title = $(element)
                    .find(".result__a")
                    .first()
                    .text()
                    .replace(/\s+/g, " ")
                    .trim();
                const description = $(element)
                    .find(".result__snippet")
                    .first()
                    .text()
                    .replace(/\s+/g, " ")
                    .trim();
                const rawLink = $(element).find(".result__a").first().attr("href")?.trim() ?? "";
                const link = this.normalizeDuckDuckGoLink(rawLink);
                if (!title || !link) {
                    return;
                }
                if (!site.searchDomains.some((domain) => link.includes(domain))) {
                    return;
                }
                jobs.push({
                    title,
                    company: this.inferCompanyFromTitle(title, site.platform),
                    description: description || title,
                    link,
                    platform: site.platform,
                    location: this.extractLocation(description) || DEFAULT_LOCATION,
                    postedDate: new Date().toISOString(),
                    applicantCount: 0,
                    sourceMode: this.sourceMode,
                });
            });
            const deduped = new Map();
            for (const job of jobs) {
                deduped.set(job.link, job);
            }
            return [...deduped.values()];
        }
        catch {
            return [];
        }
    }
    parseJobsForSite(siteKey, html, url) {
        return parseJobsFromHtml(siteKey, html, url);
    }
    parseWithHeuristics($, site, origin) {
        const jobs = $(site.cardSelectors.join(","))
            .toArray()
            .map((card) => {
            const cardRoot = $(card);
            const title = this.firstText(cardRoot, [
                "h2 a",
                "h2",
                "h3 a",
                "h3",
                "a[title]",
                "[class*='title'] a",
            ]);
            const company = this.firstText(cardRoot, [
                "span.companyName",
                "[class*='company']",
                "[data-testid*='company']",
            ]);
            const location = this.firstText(cardRoot, [
                "div.companyLocation",
                "[class*='location']",
                "[data-testid*='location']",
            ]);
            const description = this.firstText(cardRoot, [
                "div.job-snippet",
                "[class*='snippet']",
                "[class*='description']",
                "p",
            ]);
            const relativeLink = this.firstAttr(cardRoot, ["h2 a[href]", "h3 a[href]", "a[href]"], "href");
            const link = this.toAbsoluteUrl(origin, relativeLink);
            if (!title || !company || !link) {
                return null;
            }
            const job = {
                title,
                company,
                description: description || `${title} at ${company}`,
                link,
                platform: site.platform,
                location: location || DEFAULT_LOCATION,
                postedDate: new Date().toISOString(),
                applicantCount: 0,
                sourceMode: this.sourceMode,
            };
            return job;
        });
        return jobs.filter((job) => job !== null);
    }
    buildSearchQuery(preferredRoles) {
        return preferredRoles.find((role) => role.trim().length > 0) ?? DEFAULT_QUERY;
    }
    normalizeDuckDuckGoLink(candidate) {
        if (!candidate) {
            return "";
        }
        try {
            const url = new URL(candidate, "https://html.duckduckgo.com");
            const redirected = url.searchParams.get("uddg");
            return redirected ? decodeURIComponent(redirected) : url.toString();
        }
        catch {
            return candidate;
        }
    }
    inferCompanyFromTitle(title, fallbackPlatform) {
        const separators = [" at ", " | ", " - ", " – "];
        for (const separator of separators) {
            const parts = title.split(separator);
            if (parts.length >= 2) {
                const company = parts[parts.length - 1]?.trim();
                if (company) {
                    return company;
                }
            }
        }
        return fallbackPlatform;
    }
    extractLocation(text) {
        const match = text.match(/\b(remote|bangalore|bengaluru|hyderabad|pune|mumbai|delhi|gurgaon|noida|chennai)\b/i);
        return match?.[1] ?? "";
    }
    getSearchRelevance(job, preferredRoles, profileSkills) {
        const haystack = [job.title, job.description, job.company, job.location]
            .join(" ")
            .toLowerCase();
        const roleMatches = preferredRoles
            .map((role) => role.trim().toLowerCase())
            .filter((role) => role.length >= 3 && haystack.includes(role)).length;
        const skillMatches = profileSkills
            .map((skill) => skill.trim().toLowerCase())
            .filter((skill) => skill.length >= 3 && haystack.includes(skill)).length;
        return roleMatches * 3 + skillMatches;
    }
    firstText(cardRoot, selectors) {
        for (const selector of selectors) {
            const text = cardRoot
                .find(selector)
                .first()
                .text()
                .replace(/\s+/g, " ")
                .trim();
            if (text) {
                return text;
            }
        }
        return "";
    }
    firstAttr(cardRoot, selectors, attribute) {
        for (const selector of selectors) {
            const value = cardRoot.find(selector).first().attr(attribute)?.trim();
            if (value) {
                return value;
            }
        }
        return "";
    }
    toAbsoluteUrl(origin, candidate) {
        if (!candidate) {
            return "";
        }
        try {
            return new URL(candidate, origin).toString();
        }
        catch {
            return "";
        }
    }
    async loadHtml(url) {
        try {
            const response = await fetch(url, {
                headers: DEFAULT_HEADERS,
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
        }
        catch (error) {
            if (!this.isLocalTlsFetchError(error)) {
                throw error;
            }
            const { stdout } = await execFileAsync("curl", [
                "-fsSL",
                "-A",
                DEFAULT_HEADERS["User-Agent"],
                url,
            ]);
            return stdout;
        }
    }
    isLocalTlsFetchError(error) {
        if (!(error instanceof Error) || !("cause" in error)) {
            return false;
        }
        const cause = error.cause;
        if (!cause || typeof cause !== "object" || !("code" in cause)) {
            return false;
        }
        return [
            "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
            "SELF_SIGNED_CERT_IN_CHAIN",
            "CERT_HAS_EXPIRED",
            "DEPTH_ZERO_SELF_SIGNED_CERT",
        ].includes(String(cause.code));
    }
}
const SITE_CONFIGS = [
    {
        key: "indeed",
        platform: "Indeed",
        searchDomains: ["indeed.com"],
        cardSelectors: ["div.job_seen_beacon"],
        buildUrls: (query, pageCount) => buildSequentialUrls(pageCount, (pageIndex) => {
            const url = new URL("https://www.indeed.com/jobs");
            url.searchParams.set("q", query);
            url.searchParams.set("l", "remote");
            if (pageIndex > 0) {
                url.searchParams.set("start", String(pageIndex * 10));
            }
            return url.toString();
        }),
        parseCard: (html, origin) => parseSiteCard(html, origin, {
            platform: "Indeed",
            titleSelectors: [
                "h2.jobTitle span[title]",
                "h2.jobTitle a span",
                "h2.jobTitle",
            ],
            companySelectors: ["span.companyName"],
            locationSelectors: ["div.companyLocation"],
            descriptionSelectors: ["div.job-snippet", "ul li"],
            linkSelectors: ["h2.jobTitle a[href]"],
        }),
    },
    {
        key: "naukri",
        platform: "Naukri",
        searchDomains: ["naukri.com"],
        cardSelectors: ["article.jobTuple", "div.srp-jobtuple-wrapper"],
        buildUrls: (query, pageCount) => buildSequentialUrls(pageCount, (pageIndex) => {
            const slug = query.trim().toLowerCase().replace(/\s+/g, "-");
            return pageIndex === 0
                ? `https://www.naukri.com/${slug}-jobs`
                : `https://www.naukri.com/${slug}-jobs-${pageIndex + 1}`;
        }),
        parseCard: (html, origin) => parseSiteCard(html, origin, {
            platform: "Naukri",
            titleSelectors: ["a.title", "a[title]", "h2 a"],
            companySelectors: ["a.comp-name", "span.comp-dtls-wrap a", "a.company"],
            locationSelectors: ["span.locWdth", "span.location", "div.location"],
            descriptionSelectors: [
                "span.job-desc",
                "div.job-description",
                "div.row3",
            ],
            linkSelectors: ["a.title[href]", "a[title][href]", "h2 a[href]"],
        }),
    },
    {
        key: "foundit",
        platform: "Foundit",
        searchDomains: ["foundit.in"],
        cardSelectors: ["div.cardContainer", "div.srpResultCard"],
        buildUrls: (query, pageCount) => buildSequentialUrls(pageCount, (pageIndex) => {
            const url = new URL("https://www.foundit.in/srp/results");
            url.searchParams.set("query", query);
            url.searchParams.set("locations", "Remote");
            url.searchParams.set("page", String(pageIndex + 1));
            return url.toString();
        }),
        parseCard: (html, origin) => parseSiteCard(html, origin, {
            platform: "Foundit",
            titleSelectors: ["a.title", "h3 a", "div.jobTitle a", "h2 a"],
            companySelectors: [
                "a.company-name",
                "span.company-name",
                "div.companyName",
            ],
            locationSelectors: ["div.loc", "span.loc", "div.location"],
            descriptionSelectors: ["div.job-desc", "div.desc", "p"],
            linkSelectors: ["a.title[href]", "h3 a[href]", "h2 a[href]"],
        }),
    },
    {
        key: "hirist",
        platform: "Hirist",
        searchDomains: ["hirist.tech"],
        cardSelectors: ["div.job-card", "div[data-testid='job-card']", "article"],
        buildUrls: (query, pageCount) => buildSequentialUrls(pageCount, (pageIndex) => `https://www.hirist.tech/search/jobs/${query}?pageNo=${pageIndex + 1}`),
        parseCard: (html, origin) => parseSiteCard(html, origin, {
            platform: "Hirist",
            titleSelectors: [
                "a[data-testid='job-title']",
                "h2 a",
                "a.job-title",
                "h3 a",
            ],
            companySelectors: [
                "[data-testid='company-name']",
                ".company-name",
                ".company",
            ],
            locationSelectors: [
                "[data-testid='job-location']",
                ".location",
                ".job-location",
            ],
            descriptionSelectors: [".job-desc", ".job-description", "p"],
            linkSelectors: [
                "a[data-testid='job-title'][href]",
                "h2 a[href]",
                "a.job-title[href]",
                "h3 a[href]",
            ],
        }),
    },
    {
        key: "cutshort",
        platform: "Cutshort",
        searchDomains: ["cutshort.io"],
        cardSelectors: [
            "a[data-testid='job-card']",
            "div[data-testid='job-card']",
            "a.job-card",
        ],
        buildUrls: (query, pageCount) => buildSequentialUrls(pageCount, (pageIndex) => {
            const url = new URL("https://cutshort.io/search-jobs");
            url.searchParams.set("search", query);
            url.searchParams.set("page", String(pageIndex + 1));
            return url.toString();
        }),
        parseCard: (html, origin) => parseSiteCard(html, origin, {
            platform: "Cutshort",
            titleSelectors: ["[data-testid='job-title']", "h2", "h3", "a h2"],
            companySelectors: [
                "[data-testid='company-name']",
                ".company-name",
                ".company",
            ],
            locationSelectors: [
                "[data-testid='job-location']",
                ".location",
                ".job-location",
            ],
            descriptionSelectors: [
                "[data-testid='job-description']",
                ".job-description",
                "p",
            ],
            linkSelectors: [
                "a[data-testid='job-card'][href]",
                "a.job-card[href]",
                "a[href]",
            ],
        }),
    },
    {
        key: "instahyre",
        platform: "Instahyre",
        searchDomains: ["instahyre.com"],
        cardSelectors: ["div.job-card", "div.opp-container", "div[class*='job']"],
        buildUrls: (query, pageCount) => buildSequentialUrls(pageCount, (pageIndex) => {
            const url = new URL("https://www.instahyre.com/job-search/");
            url.searchParams.set("search", query);
            url.searchParams.set("page", String(pageIndex + 1));
            return url.toString();
        }),
        parseCard: (html, origin) => parseSiteCard(html, origin, {
            platform: "Instahyre",
            titleSelectors: [".profile", ".job-title", "h2", "h3"],
            companySelectors: [".company", ".company-name", "[class*='company']"],
            locationSelectors: [
                ".location",
                ".job-location",
                "[class*='location']",
            ],
            descriptionSelectors: [".skills", ".job-description", "p"],
            linkSelectors: ["a[href]"],
        }),
    },
    {
        key: "myjobai",
        platform: "My Job AI",
        searchDomains: ["myjob.ai", "myjobai.com"],
        cardSelectors: ["article", "div.job-card", "div[class*='job']"],
        buildUrls: (_query, pageCount) => {
            if (!env.MYJOBAI_SEARCH_URL) {
                return [];
            }
            return buildSequentialUrls(pageCount, (pageIndex) => {
                const url = new URL(env.MYJOBAI_SEARCH_URL);
                url.searchParams.set("page", String(pageIndex + 1));
                return url.toString();
            });
        },
        parseCard: (html, origin) => parseSiteCard(html, origin, {
            platform: "My Job AI",
            titleSelectors: ["h2 a", "h2", "h3 a", "h3", "[class*='title'] a"],
            companySelectors: ["[class*='company']", "span.companyName"],
            locationSelectors: ["[class*='location']", "div.companyLocation"],
            descriptionSelectors: [
                "[class*='description']",
                "[class*='snippet']",
                "p",
            ],
            linkSelectors: ["h2 a[href]", "h3 a[href]", "a[href]"],
        }),
    },
];
const SITE_CONFIG_MAP = new Map(SITE_CONFIGS.map((site) => [site.key, site]));
export function getPublicScrapeUrls(siteKey, preferredRole, pageCount = env.PUBLIC_JOB_SCRAPE_PAGES) {
    const site = SITE_CONFIG_MAP.get(siteKey);
    if (!site) {
        return [];
    }
    const query = preferredRole.trim() || DEFAULT_QUERY;
    return site.buildUrls(query, pageCount);
}
export function parseJobsFromHtml(siteKey, html, url) {
    const site = SITE_CONFIG_MAP.get(siteKey);
    if (!site) {
        return [];
    }
    const origin = new URL(url);
    const $ = load(html);
    const jobs = site.parseCard
        ? $(site.cardSelectors.join(","))
            .toArray()
            .map((card) => site.parseCard($.html(card), origin))
            .filter((job) => job !== null)
        : parseWithHeuristics($, site, origin);
    return jobs;
}
function parseSiteCard(html, origin, config) {
    const $ = load(html);
    const root = $.root();
    const title = firstText(root, config.titleSelectors);
    const company = firstText(root, config.companySelectors);
    const location = firstText(root, config.locationSelectors);
    const description = firstText(root, config.descriptionSelectors);
    const link = toAbsoluteUrl(origin, firstAttr(root, config.linkSelectors, "href"));
    if (!title || !company || !link) {
        return null;
    }
    return {
        title,
        company,
        description: description || `${title} at ${company}`,
        link,
        platform: config.platform,
        location: location || DEFAULT_LOCATION,
        postedDate: new Date().toISOString(),
        applicantCount: 0,
        sourceMode: "remote",
    };
}
function buildSequentialUrls(pageCount, builder) {
    return Array.from({ length: Math.max(1, pageCount) }, (_, index) => builder(index));
}
function parseWithHeuristics($, site, origin) {
    const jobs = $(site.cardSelectors.join(","))
        .toArray()
        .map((card) => {
        const cardRoot = $(card);
        const title = firstText(cardRoot, [
            "h2 a",
            "h2",
            "h3 a",
            "h3",
            "a[title]",
            "[class*='title'] a",
        ]);
        const company = firstText(cardRoot, [
            "span.companyName",
            "[class*='company']",
            "[data-testid*='company']",
        ]);
        const location = firstText(cardRoot, [
            "div.companyLocation",
            "[class*='location']",
            "[data-testid*='location']",
        ]);
        const description = firstText(cardRoot, [
            "div.job-snippet",
            "[class*='snippet']",
            "[class*='description']",
            "p",
        ]);
        const relativeLink = firstAttr(cardRoot, ["h2 a[href]", "h3 a[href]", "a[href]"], "href");
        const link = toAbsoluteUrl(origin, relativeLink);
        if (!title || !company || !link) {
            return null;
        }
        return {
            title,
            company,
            description: description || `${title} at ${company}`,
            link,
            platform: site.platform,
            location: location || DEFAULT_LOCATION,
            postedDate: new Date().toISOString(),
            applicantCount: 0,
            sourceMode: "remote",
        };
    });
    return jobs.filter((job) => job !== null);
}
function firstText(root, selectors) {
    for (const selector of selectors) {
        const value = root
            .find(selector)
            .first()
            .text()
            .replace(/\s+/g, " ")
            .trim();
        if (value) {
            return value;
        }
    }
    return "";
}
function firstAttr(root, selectors, attribute) {
    for (const selector of selectors) {
        const value = root.find(selector).first().attr(attribute)?.trim();
        if (value) {
            return value;
        }
    }
    return "";
}
function toAbsoluteUrl(origin, candidate) {
    if (!candidate) {
        return "";
    }
    try {
        return new URL(candidate, origin).toString();
    }
    catch {
        return "";
    }
}
//# sourceMappingURL=public-html-job-provider.js.map