const DAY_IN_MS = 86_400_000;
function toTimestamp(value) {
    if (!value) {
        return 0;
    }
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
}
export function getJobAgeInDays(postedDate) {
    const timestamp = toTimestamp(postedDate);
    if (!timestamp) {
        return Number.MAX_SAFE_INTEGER;
    }
    return Math.max(0, Math.floor((Date.now() - timestamp) / DAY_IN_MS));
}
export function isEarlyApplicantJob(job) {
    return (getJobAgeInDays(job.postedDate) <= 2 &&
        (job.applicantCount ?? Number.MAX_SAFE_INTEGER) < 50);
}
export function sortJobsByPriority(jobs) {
    return [...jobs].sort((left, right) => {
        const leftHighMatch = (left.relevanceScore ?? 0) >= 90 ? 1 : 0;
        const rightHighMatch = (right.relevanceScore ?? 0) >= 90 ? 1 : 0;
        if (rightHighMatch !== leftHighMatch) {
            return rightHighMatch - leftHighMatch;
        }
        const leftEarlyApplicant = isEarlyApplicantJob(left) ? 1 : 0;
        const rightEarlyApplicant = isEarlyApplicantJob(right) ? 1 : 0;
        if (rightEarlyApplicant !== leftEarlyApplicant) {
            return rightEarlyApplicant - leftEarlyApplicant;
        }
        if ((right.relevanceScore ?? 0) !== (left.relevanceScore ?? 0)) {
            return (right.relevanceScore ?? 0) - (left.relevanceScore ?? 0);
        }
        const leftPostedAt = toTimestamp(left.postedDate);
        const rightPostedAt = toTimestamp(right.postedDate);
        if (rightPostedAt !== leftPostedAt) {
            return rightPostedAt - leftPostedAt;
        }
        if ((left.applicantCount ?? 999) !== (right.applicantCount ?? 999)) {
            return (left.applicantCount ?? 999) - (right.applicantCount ?? 999);
        }
        return toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
    });
}
//# sourceMappingURL=job-ranking.service.js.map