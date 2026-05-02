import { env } from "../config/env.js";
export class AiSidecarService {
    isConfigured() {
        if (env.NODE_ENV === "test") {
            return false;
        }
        return Boolean(env.AI_SIDECAR_URL);
    }
    async semanticMatch(profileSkills, jobDescription) {
        if (!this.isConfigured()) {
            return null;
        }
        return this.postJson("/match", {
            profileSkills,
            jobDescription,
        });
    }
    async cleanupResume(resume) {
        if (!this.isConfigured()) {
            return null;
        }
        return this.postJson("/resume/cleanup", resume);
    }
    async upsertJobIndex(userId, jobs) {
        if (!this.isConfigured() || jobs.length === 0) {
            return null;
        }
        return this.postJson("/index/jobs/upsert", {
            userId,
            jobs,
        });
    }
    async searchJobIndex(userId, query, topK = 25) {
        if (!this.isConfigured() || !query.trim()) {
            return null;
        }
        return this.postJson("/index/jobs/search", {
            userId,
            query,
            topK,
        });
    }
    async postJson(path, payload) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), env.AI_SIDECAR_TIMEOUT_MS);
        try {
            const url = new URL(path, env.AI_SIDECAR_URL);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`AI sidecar returned HTTP ${response.status}`);
            }
            return (await response.json());
        }
        finally {
            clearTimeout(timeout);
        }
    }
}
//# sourceMappingURL=ai-sidecar.service.js.map