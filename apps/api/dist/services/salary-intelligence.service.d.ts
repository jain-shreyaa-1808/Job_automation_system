type SalaryAdvice = {
    marketRange: {
        min: number;
        max: number;
    };
    negotiationTips: string[];
};
export declare class SalaryIntelligenceService {
    generate(currentCtc: number, expectedCtc: number, preferredRoles: string[]): SalaryAdvice;
}
export {};
