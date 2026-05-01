export declare class OutreachService {
    generate(userId: string, jobId: string, recruiterLeadId?: string): Promise<{
        email: string;
        linkedinMessage: string;
    }>;
}
