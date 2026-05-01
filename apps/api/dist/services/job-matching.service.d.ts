type MatchResult = {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestedImprovements: string[];
};
export declare class JobMatchingService {
    match(profileSkills: string[], jobDescription: string): MatchResult;
}
export {};
