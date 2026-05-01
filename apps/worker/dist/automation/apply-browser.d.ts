type ApplyOptions = {
    jobLink: string;
    resumePath?: string;
    rateLimitPerMinute: number;
    headless: boolean;
};
type ApplyResult = {
    status: "submitted" | "manual-review";
    details: string;
};
export declare function runAutoApply(options: ApplyOptions): Promise<ApplyResult>;
export {};
