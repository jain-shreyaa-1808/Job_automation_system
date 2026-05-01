const SKILL_ALIASES = {
    javascript: "javascript",
    typescript: "typescript",
    react: "react",
    node: "node.js",
    "node.js": "node.js",
    express: "express",
    mongodb: "mongodb",
    mongoose: "mongoose",
    redis: "redis",
    aws: "aws",
    azure: "azure",
    docker: "docker",
    kubernetes: "kubernetes",
    python: "python",
    java: "java",
    networking: "networking",
    cisco: "cisco",
    tac: "technical support",
    wireless: "wireless",
};
export function extractSkills(text) {
    const tokens = text
        .toLowerCase()
        .split(/[^a-z0-9.+#-]+/)
        .filter(Boolean);
    const normalized = new Set();
    for (const token of tokens) {
        if (SKILL_ALIASES[token]) {
            normalized.add(SKILL_ALIASES[token]);
        }
    }
    return [...normalized];
}
//# sourceMappingURL=skill-normalizer.js.map