import { extractSkills } from "../utils/skill-normalizer.js";
export class JobMatchingService {
    match(profileSkills, jobDescription) {
        const jobSkills = extractSkills(jobDescription);
        const matchedSkills = jobSkills.filter((skill) => profileSkills.includes(skill));
        const missingSkills = jobSkills.filter((skill) => !profileSkills.includes(skill));
        const denominator = Math.max(jobSkills.length, 1);
        const matchScore = Math.round((matchedSkills.length / denominator) * 100);
        return {
            matchScore,
            matchedSkills,
            missingSkills,
            suggestedImprovements: missingSkills.map((skill) => `Add measurable project or hands-on experience demonstrating ${skill}.`),
        };
    }
}
//# sourceMappingURL=job-matching.service.js.map