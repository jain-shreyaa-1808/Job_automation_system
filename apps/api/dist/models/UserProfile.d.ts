import { Schema, Types, type InferSchemaType } from "mongoose";
declare const userProfileSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export type UserProfileDocument = InferSchemaType<typeof userProfileSchema> & {
    _id: string;
};
export declare const UserProfileModel: import("mongoose").Model<{
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
    name: string;
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    skills: string[];
    experience: Types.DocumentArray<{
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        title?: string | null | undefined;
        company?: string | null | undefined;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    projects: Types.DocumentArray<{
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }> & {
        technologies: string[];
        name?: string | null | undefined;
        summary?: string | null | undefined;
    }>;
    education: Types.DocumentArray<{
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }> & {
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        institution?: string | null | undefined;
        degree?: string | null | undefined;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
    resumeFileName?: string | null | undefined;
    resumeStoragePath?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>>;
export {};
