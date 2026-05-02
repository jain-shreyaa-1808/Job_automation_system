type ParsedResume = {
    name: string;
    skills: string[];
    projects: Array<{
        name: string;
        summary: string;
        technologies: string[];
    }>;
    experience: Array<{
        company: string;
        title: string;
        startDate: string;
        endDate: string;
        summary: string;
    }>;
    education: Array<{
        institution: string;
        degree: string;
        startDate: string;
        endDate: string;
    }>;
    certifications: string[];
    parsedText: string;
    resumeScore: number;
};
export declare class ResumeParserService {
    private readonly aiSidecarService;
    private readonly aiChatService;
    parseAndStore(userId: string, file: Express.Multer.File): Promise<ParsedResume>;
    sampleOutput(): {
        name: string;
        skills: string[];
        projects: {
            name: string;
            summary: string;
            technologies: string[];
        }[];
        experience: {
            company: string;
            title: string;
            startDate: string;
            endDate: string;
            summary: string;
        }[];
        education: {
            institution: string;
            degree: string;
            startDate: string;
            endDate: string;
        }[];
        certifications: string[];
        parsedText: string;
        resumeScore: number;
    };
    private extractText;
    private structureResume;
    private hybridCleanupResume;
    private cleanupResumeWithModel;
    private mergeResume;
    private sanitizeResumeShape;
    private uniqueStrings;
    private splitSections;
    private extractProjects;
    private extractExperience;
    private extractEducation;
    private extractCertifications;
}
export {};
