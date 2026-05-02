export declare class DashboardService {
    getDashboard(userId: string): Promise<{
        tabs: {
            newJobs: (import("mongoose").Document<unknown, {}, {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps, {}, {
                timestamps: true;
            }> & {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
            applied: (import("mongoose").Document<unknown, {}, {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps, {}, {
                timestamps: true;
            }> & {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
            inProgress: (import("mongoose").Document<unknown, {}, {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps, {}, {
                timestamps: true;
            }> & {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
            finished: (import("mongoose").Document<unknown, {}, {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps, {}, {
                timestamps: true;
            }> & {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
            bookmarked: (import("mongoose").Document<unknown, {}, {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps, {}, {
                timestamps: true;
            }> & {
                status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
                link: string;
                description: string;
                sourceUserId: {
                    prototype?: import("mongoose").Types.ObjectId | null | undefined;
                    cacheHexString?: unknown;
                    generate?: {} | null | undefined;
                    createFromTime?: {} | null | undefined;
                    createFromHexString?: {} | null | undefined;
                    createFromBase64?: {} | null | undefined;
                    isValid?: {} | null | undefined;
                };
                title: string;
                normalizedTitle: string;
                company: string;
                platform: string;
                location: string;
                extractedSkills: string[];
                categoryTags: string[];
                relevanceScore: number;
                matchedSkills: string[];
                missingSkills: string[];
                experienceMin: number;
                experienceMax: number;
                employmentType: string;
                applicantCount: number;
                jobSource: "mock" | "remote";
                linkStatus: "valid" | "invalid" | "unchecked";
                discoveredAt: NativeDate;
                externalId?: string | null | undefined;
                postedDate?: NativeDate | null | undefined;
                linkCheckedAt?: NativeDate | null | undefined;
            } & import("mongoose").DefaultTimestampProps & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
        };
        applications: (import("mongoose").Document<unknown, {}, {
            status: "new" | "pending-verification" | "applied" | "in-progress" | "finished";
            userId: {
                prototype?: import("mongoose").Types.ObjectId | null | undefined;
                cacheHexString?: unknown;
                generate?: {} | null | undefined;
                createFromTime?: {} | null | undefined;
                createFromHexString?: {} | null | undefined;
                createFromBase64?: {} | null | undefined;
                isValid?: {} | null | undefined;
            };
            jobId: {
                prototype?: import("mongoose").Types.ObjectId | null | undefined;
                cacheHexString?: unknown;
                generate?: {} | null | undefined;
                createFromTime?: {} | null | undefined;
                createFromHexString?: {} | null | undefined;
                createFromBase64?: {} | null | undefined;
                isValid?: {} | null | undefined;
            };
            appliedVia: string;
            preFilledData: any;
            history: import("mongoose").Types.DocumentArray<{
                action: string;
                details: string;
                createdAt: NativeDate;
            }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
                action: string;
                details: string;
                createdAt: NativeDate;
            }> & {
                action: string;
                details: string;
                createdAt: NativeDate;
            }>;
            tailoredResumePath?: string | null | undefined;
            lastAttemptedAt?: NativeDate | null | undefined;
        } & import("mongoose").DefaultTimestampProps, {}, {
            timestamps: true;
        }> & {
            status: "new" | "pending-verification" | "applied" | "in-progress" | "finished";
            userId: {
                prototype?: import("mongoose").Types.ObjectId | null | undefined;
                cacheHexString?: unknown;
                generate?: {} | null | undefined;
                createFromTime?: {} | null | undefined;
                createFromHexString?: {} | null | undefined;
                createFromBase64?: {} | null | undefined;
                isValid?: {} | null | undefined;
            };
            jobId: {
                prototype?: import("mongoose").Types.ObjectId | null | undefined;
                cacheHexString?: unknown;
                generate?: {} | null | undefined;
                createFromTime?: {} | null | undefined;
                createFromHexString?: {} | null | undefined;
                createFromBase64?: {} | null | undefined;
                isValid?: {} | null | undefined;
            };
            appliedVia: string;
            preFilledData: any;
            history: import("mongoose").Types.DocumentArray<{
                action: string;
                details: string;
                createdAt: NativeDate;
            }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
                action: string;
                details: string;
                createdAt: NativeDate;
            }> & {
                action: string;
                details: string;
                createdAt: NativeDate;
            }>;
            tailoredResumePath?: string | null | undefined;
            lastAttemptedAt?: NativeDate | null | undefined;
        } & import("mongoose").DefaultTimestampProps & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        recruiterLeads: (import("mongoose").Document<unknown, {}, {
            name: string;
            userId: {
                prototype?: import("mongoose").Types.ObjectId | null | undefined;
                cacheHexString?: unknown;
                generate?: {} | null | undefined;
                createFromTime?: {} | null | undefined;
                createFromHexString?: {} | null | undefined;
                createFromBase64?: {} | null | undefined;
                isValid?: {} | null | undefined;
            };
            jobId: {
                prototype?: import("mongoose").Types.ObjectId | null | undefined;
                cacheHexString?: unknown;
                generate?: {} | null | undefined;
                createFromTime?: {} | null | undefined;
                createFromHexString?: {} | null | undefined;
                createFromBase64?: {} | null | undefined;
                isValid?: {} | null | undefined;
            };
            title: string;
            company: string;
            recentPosts: string[];
            state: "finished" | "pending" | "action-taken";
            profileUrl?: string | null | undefined;
        } & import("mongoose").DefaultTimestampProps, {}, {
            timestamps: true;
        }> & {
            name: string;
            userId: {
                prototype?: import("mongoose").Types.ObjectId | null | undefined;
                cacheHexString?: unknown;
                generate?: {} | null | undefined;
                createFromTime?: {} | null | undefined;
                createFromHexString?: {} | null | undefined;
                createFromBase64?: {} | null | undefined;
                isValid?: {} | null | undefined;
            };
            jobId: {
                prototype?: import("mongoose").Types.ObjectId | null | undefined;
                cacheHexString?: unknown;
                generate?: {} | null | undefined;
                createFromTime?: {} | null | undefined;
                createFromHexString?: {} | null | undefined;
                createFromBase64?: {} | null | undefined;
                isValid?: {} | null | undefined;
            };
            title: string;
            company: string;
            recentPosts: string[];
            state: "finished" | "pending" | "action-taken";
            profileUrl?: string | null | undefined;
        } & import("mongoose").DefaultTimestampProps & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        resumeScore: number;
        skillGapRoadmap: string[];
        interviewQuestions: string[];
    }>;
}
