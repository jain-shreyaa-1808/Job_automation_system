import type { Job } from "bullmq";
import type { AutoApplyJobPayload } from "@job-automation/shared";
export declare function handleAutoApply(job: Job<AutoApplyJobPayload>): Promise<{
    status: "submitted" | "manual-review";
    details: string;
}>;
