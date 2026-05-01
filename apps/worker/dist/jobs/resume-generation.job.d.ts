import type { Job } from "bullmq";
import type { ResumeGenerationPayload } from "@job-automation/shared";
export declare function handleResumeGeneration(job: Job<ResumeGenerationPayload>): Promise<{
    status: string;
    template: "latex";
    jobId: string;
}>;
