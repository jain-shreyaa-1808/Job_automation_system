import { extractSkills } from "../utils/skill-normalizer.js";
import { AiSidecarService } from "./ai-sidecar.service.js";
import { AiChatService } from "./ai-chat.service.js";
export class JobMatchingService {
    aiSidecarService = new AiSidecarService();
    aiChatService = new AiChatService();
    async match(profileSkills, jobDescription) {
        if (this.aiSidecarService.isConfigured()) {
            const sidecarResult = await this.matchWithSidecar(profileSkills, jobDescription);
            if (sidecarResult) {
                return sidecarResult;
            }
        }
        if (this.aiChatService.isConfigured()) {
            const aiResult = await this.matchWithModel(profileSkills, jobDescription);
            if (aiResult) {
                return aiResult;
            }
        }
        return this.matchWithSkills(profileSkills, jobDescription);
    }
    async matchWithSidecar(profileSkills, jobDescription) {
        try {
            const response = await this.aiSidecarService.semanticMatch(extractSkills(profileSkills.join(" ")), jobDescription);
            if (!response) {
                return null;
            }
            const matchScore = Math.max(0, Math.min(100, Math.round(Number(response.matchScore) || 0)));
            return {
                matchScore,
                matchedSkills: this.normalizeSkillList(response.matchedSkills),
                missingSkills: this.normalizeSkillList(response.missingSkills),
                suggestedImprovements: this.normalizeStringList(response.suggestedImprovements),
            };
        }
        catch {
            return null;
        }
    }
    async matchWithModel(profileSkills, jobDescription) {
        try {
            const normalizedProfileSkills = extractSkills(profileSkills.join(" "));
            const response = await this.aiChatService.completeJson([
                {
                    role: "system",
                    content: "You rank resume-to-job semantic fit. Return valid JSON with keys matchScore, matchedSkills, missingSkills, and suggestedImprovements. matchScore must be an integer from 0 to 100. Keep skills normalized to lowercase technology names. Do not include markdown fences.",
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        profileSkills: normalizedProfileSkills,
                        jobDescription,
                    }),
                },
            ]);
            const matchedSkills = this.normalizeSkillList(response.matchedSkills);
            const missingSkills = this.normalizeSkillList(response.missingSkills);
            const suggestedImprovements = this.normalizeStringList(response.suggestedImprovements);
            const rawScore = Number(response.matchScore);
            const matchScore = Number.isFinite(rawScore)
                ? Math.max(0, Math.min(100, Math.round(rawScore)))
                : NaN;
            if (!Number.isFinite(matchScore)) {
                return null;
            }
            return {
                matchScore,
                matchedSkills,
                missingSkills,
                suggestedImprovements: suggestedImprovements.length > 0
                    ? suggestedImprovements
                    : missingSkills.map((skill) => `Add measurable project or hands-on experience demonstrating ${skill}.`),
            };
        }
        catch {
            return null;
        }
    }
    matchWithSkills(profileSkills, jobDescription) {
        const normalizedProfileSkills = new Set(extractSkills(profileSkills.join(" ")));
        const jobSkills = extractSkills(jobDescription);
        const matchedSkills = jobSkills.filter((skill) => normalizedProfileSkills.has(skill));
        const missingSkills = jobSkills.filter((skill) => !normalizedProfileSkills.has(skill));
        const denominator = Math.max(jobSkills.length, 1);
        const matchScore = Math.round((matchedSkills.length / denominator) * 100);
        return {
            matchScore,
            matchedSkills,
            missingSkills,
            suggestedImprovements: missingSkills.map((skill) => `Add measurable project or hands-on experience demonstrating ${skill}.`),
        };
    }
    normalizeSkillList(value) {
        return this.normalizeStringList(value).map((skill) => skill.toLowerCase());
    }
    normalizeStringList(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return [...new Set(value)]
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }
}
//# sourceMappingURL=job-matching.service.js.map