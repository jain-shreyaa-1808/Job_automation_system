type MatchResult = {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestedImprovements: string[];
};
export declare class JobMatchingService {
    private readonly aiSidecarService;
    private readonly aiChatService;
    match(profileSkills: string[], jobDescription: string): Promise<MatchResult>;
    private matchWithSidecar;
    private matchWithModel;
    private matchWithSkills;
    private normalizeSkillList;
    private normalizeStringList;
}
export {};
