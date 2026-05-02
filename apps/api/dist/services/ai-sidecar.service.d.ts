type MatchResult = {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestedImprovements: string[];
};
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
export declare class AiSidecarService {
    isConfigured(): boolean;
    semanticMatch(profileSkills: string[], jobDescription: string): Promise<MatchResult | null>;
    cleanupResume(resume: ParsedResume): Promise<ParsedResume | null>;
    upsertJobIndex(userId: string, jobs: Array<{
        id: string;
        title: string;
        company: string;
        description: string;
        location: string;
        platform: string;
        matchedSkills: string[];
        extractedSkills: string[];
    }>): Promise<{
        indexedCount: number;
    } | null>;
    searchJobIndex(userId: string, query: string, topK?: number): Promise<{
        matches: Array<{
            id: string;
            score: number;
        }>;
    } | null>;
    private postJson;
}
export {};
