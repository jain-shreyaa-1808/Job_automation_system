type AutoApplyInput = {
    userId: string;
    jobId: string;
    manualOverride?: boolean;
};
type ConfirmApplicationInput = {
    userId: string;
    jobId: string;
    applicationData: Record<string, unknown>;
};
export declare class AutoApplyService {
    /**
     * Step 1: Pre-fill application form data from user's profile and return for verification.
     * Does NOT submit yet — just prepares the data for user review.
     */
    requestApplication(input: AutoApplyInput): Promise<{
        application: import("mongoose").Document<unknown, {}, {
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
        };
        preFilledData: {
            fullName: string;
            email: string;
            phone: string;
            location: string;
            currentTitle: string;
            currentCompany: string;
            totalExperience: string;
            skills: string[];
            linkedinUrl: string;
            portfolioUrl: string;
            githubUrl: string;
            jobTitle: string;
            company: string;
            jobLink: string;
            noticePeriod: string;
            expectedCtc: string | number;
            currentCtc: string | number;
            willingToRelocate: boolean | null;
            coverNote: string;
            resumeFileName: string;
            hasResume: boolean;
        };
        message: string;
    }>;
    /**
     * Step 2: User has verified the pre-filled data. Confirm and submit.
     */
    confirmApplication(input: ConfirmApplicationInput): Promise<{
        status: string;
        message: string;
    }>;
    private calculateExperience;
}
export {};
