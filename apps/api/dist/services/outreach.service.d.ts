export declare class OutreachService {
    generate(userId: string, jobId: string, recruiterLeadId?: string): Promise<{
        email: string;
        linkedinMessage: string;
        referralMessage: string;
    }>;
    private extractJDKeywords;
    private findBestProject;
    private findBestExperience;
    private buildColdEmail;
    private buildLinkedInMessage;
    private buildReferralMessage;
}
