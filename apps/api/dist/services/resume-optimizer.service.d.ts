export declare class ResumeOptimizerService {
    generateTailoredResume(userId: string, jobId: string): Promise<{
        documentId: import("mongoose").Types.ObjectId;
        latex: string;
        atsSuggestions: string[];
        atsKeywordsInjected: string[];
    }>;
    /** Pull meaningful terms from a JD string. */
    private extractJDKeywords;
    /** Generate actionable ATS suggestions specific to this job. */
    private generateAtsSuggestions;
    /**
     * Refine the user's EXISTING resume by:
     * - Reordering skills to front-load JD-matched ones
     * - Injecting ATS keywords into the summary
     * - Prioritising relevant projects/experience
     * - Keeping all original content intact
     */
    private buildRefinedResume;
}
