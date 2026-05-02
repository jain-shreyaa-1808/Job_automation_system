export declare class ResumeOptimizerService {
    private readonly aiChatService;
    generateTailoredResume(userId: string, jobId: string): Promise<{
        documentId: import("mongoose").Types.ObjectId;
        latex: string;
    }>;
    private refineRenderDataWithModel;
    private extractJDKeywords;
    private generateAtsSuggestions;
    private buildResumeRenderData;
    private buildRefinedResume;
    private buildPdfResume;
    private normalizeListItem;
    private normalizeSentence;
    private limitText;
    private wrapText;
}
