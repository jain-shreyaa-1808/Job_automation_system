export class WorkdayJobProvider {
    boardUrls;
    sourceMode = "remote";
    platform = "Workday";
    constructor(boardUrls) {
        this.boardUrls = boardUrls;
    }
    async fetchJobs({ preferredRoles, profileSkills }) {
        const jobsByBoard = await Promise.all(this.boardUrls.map(async (boardUrl) => {
            try {
                const parsedBoard = this.parseBoardUrl(boardUrl);
                if (!parsedBoard) {
                    return [];
                }
                const response = await fetch(parsedBoard.apiUrl, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ limit: 20, offset: 0, searchText: "" }),
                });
                if (!response.ok) {
                    return [];
                }
                const payload = (await response.json());
                return (payload.jobPostings ?? [])
                    .map((job) => this.mapJob(parsedBoard, job))
                    .filter((job) => job !== null)
                    .map((job) => ({
                    job,
                    relevance: this.getSearchRelevance(job, preferredRoles, profileSkills),
                }))
                    .filter(({ relevance }) => relevance > 0)
                    .sort((left, right) => {
                    if (right.relevance !== left.relevance) {
                        return right.relevance - left.relevance;
                    }
                    return (new Date(right.job.postedDate).getTime() -
                        new Date(left.job.postedDate).getTime());
                })
                    .map(({ job }) => job);
            }
            catch {
                return [];
            }
        }));
        return jobsByBoard.flat();
    }
    parseBoardUrl(boardUrl) {
        try {
            const url = new URL(boardUrl);
            const segments = url.pathname.split("/").filter(Boolean);
            if (segments.length === 0) {
                return null;
            }
            const localeIndex = segments.findIndex((segment) => /^[a-z]{2}(?:-[A-Z]{2})?$/i.test(segment));
            const site = segments[localeIndex >= 0 ? localeIndex + 1 : 0];
            if (!site) {
                return null;
            }
            const tenant = url.hostname.split(".")[0];
            return {
                boardUrl: url.toString(),
                apiUrl: `${url.protocol}//${url.host}/wday/cxs/${tenant}/${site}/jobs`,
                company: this.formatCompanyName(site, tenant),
            };
        }
        catch {
            return null;
        }
    }
    mapJob(board, job) {
        const title = job.title?.trim();
        const externalPath = job.externalPath?.trim();
        if (!title || !externalPath) {
            return null;
        }
        const link = new URL(externalPath.startsWith("/") ? externalPath : `/${externalPath}`, board.boardUrl).toString();
        return {
            title,
            company: board.company,
            description: (job.bulletFields ?? []).join(" ").trim() || title,
            link,
            platform: this.platform,
            location: job.locationsText?.trim() || "Remote",
            postedDate: job.postedOn
                ? new Date(job.postedOn).toISOString()
                : new Date().toISOString(),
            applicantCount: 0,
            sourceMode: this.sourceMode,
        };
    }
    getSearchRelevance(job, preferredRoles, profileSkills) {
        const haystack = [job.title, job.description, job.location, job.company]
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
    formatCompanyName(site, tenant) {
        const source = /^careers?$/i.test(site) ? tenant : site;
        return source
            .split(/[-_]/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }
}
//# sourceMappingURL=workday-job-provider.js.map