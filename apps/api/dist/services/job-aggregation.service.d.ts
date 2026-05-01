export declare class JobAggregationService {
    private readonly matcher;
    private readonly linkValidator;
    fetchForUser(userId: string): Promise<(import("mongoose").Document<unknown, {}, {
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
        company: string;
        platform: string;
        location: string;
        relevanceScore: number;
        matchedSkills: string[];
        missingSkills: string[];
        experienceMin: number;
        experienceMax: number;
        employmentType: string;
        applicantCount: number;
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
        company: string;
        platform: string;
        location: string;
        relevanceScore: number;
        matchedSkills: string[];
        missingSkills: string[];
        experienceMin: number;
        experienceMax: number;
        employmentType: string;
        applicantCount: number;
        linkStatus: "valid" | "invalid" | "unchecked";
        discoveredAt: NativeDate;
        externalId?: string | null | undefined;
        postedDate?: NativeDate | null | undefined;
        linkCheckedAt?: NativeDate | null | undefined;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
}
