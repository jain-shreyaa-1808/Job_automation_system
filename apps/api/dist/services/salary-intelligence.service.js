const ROLE_MULTIPLIERS = {
    "software engineer": 1.2,
    "network engineer": 1.05,
    "wireless tac engineer": 1.1,
    "technical consulting engineer": 1.15,
};
export class SalaryIntelligenceService {
    generate(currentCtc, expectedCtc, preferredRoles) {
        const roleFactor = preferredRoles
            .map((role) => ROLE_MULTIPLIERS[role.toLowerCase()] ?? 1)
            .reduce((sum, value) => sum + value, 0) /
            Math.max(preferredRoles.length, 1);
        const baseline = Math.max(currentCtc * roleFactor, currentCtc || expectedCtc || 6);
        return {
            marketRange: {
                min: Number((baseline * 0.95).toFixed(2)),
                max: Number((baseline * 1.25).toFixed(2)),
            },
            negotiationTips: [
                "Anchor the conversation with business impact, not just expected CTC.",
                "Use comparable market bands for early-career engineers in the target city.",
                "Negotiate across base pay, joining bonus, learning budget, and role scope.",
            ],
        };
    }
}
//# sourceMappingURL=salary-intelligence.service.js.map