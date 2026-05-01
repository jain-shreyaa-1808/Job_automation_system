type AutoApplyInput = {
    userId: string;
    jobId: string;
    manualOverride?: boolean;
};
export declare class AutoApplyService {
    requestApplication(input: AutoApplyInput): Promise<import("mongoose").Document<unknown, {}, {
        status: "new" | "applied" | "in-progress" | "finished";
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
        status: "new" | "applied" | "in-progress" | "finished";
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
    }>;
}
export {};
