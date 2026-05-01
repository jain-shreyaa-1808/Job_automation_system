import { Schema, Types, type InferSchemaType } from "mongoose";
declare const jobApplicationSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export type JobApplicationDocument = InferSchemaType<typeof jobApplicationSchema> & {
    _id: string;
};
export declare const JobApplicationModel: import("mongoose").Model<{
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
} & import("mongoose").DefaultTimestampProps, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
    _id: Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
    status: "new" | "applied" | "in-progress" | "finished";
    userId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    jobId: {
        prototype?: Types.ObjectId | null | undefined;
        cacheHexString?: unknown;
        generate?: {} | null | undefined;
        createFromTime?: {} | null | undefined;
        createFromHexString?: {} | null | undefined;
        createFromBase64?: {} | null | undefined;
        isValid?: {} | null | undefined;
    };
    appliedVia: string;
    history: Types.DocumentArray<{
        action: string;
        details: string;
        createdAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
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
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>>;
export {};
