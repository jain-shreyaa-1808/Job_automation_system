export declare class ResumeOptimizerService {
    generateTailoredResume(userId: string, jobId: string): Promise<{
        latex: string;
        atsSuggestions: string[];
        downloadUrl: any;
    }>;
    private buildLatexResume;
}
