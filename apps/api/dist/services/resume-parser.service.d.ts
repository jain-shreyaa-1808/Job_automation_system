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
    private splitSections;
    private extractProjects;
    private extractExperience;
    private extractEducation;
    private extractCertifications;
    private extractSection;
}
export {};
