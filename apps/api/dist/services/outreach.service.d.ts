export declare class OutreachService {
    private readonly aiChatService;
    generate(userId: string, jobId: string, recruiterLeadId?: string): Promise<{
        email: string;
        linkedinMessage: string;
        referralMessage: string;
    }>;
    private generateWithModel;
    private extractJDKeywords;
    private findBestProject;
    private findBestExperience;
    private buildColdEmail;
    private buildLinkedInMessage;
    private buildReferralMessage;
}
