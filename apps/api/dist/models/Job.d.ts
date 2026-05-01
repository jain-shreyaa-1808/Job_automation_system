import { Schema, Types, type InferSchemaType } from "mongoose";
declare const jobSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export type JobDocument = InferSchemaType<typeof jobSchema> & {
    _id: string;
};
export declare const JobModel: import("mongoose").Model<{
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
    status: "new" | "applied" | "in-progress" | "finished" | "bookmarked";
    link: string;
    description: string;
    sourceUserId: {
        prototype?: Types.ObjectId | null | undefined;
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
    discoveredAt: NativeDate;
    externalId?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>>;
export {};
