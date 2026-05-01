import { GeneratedDocumentModel } from "../models/GeneratedDocument.js";
import { JobModel } from "../models/Job.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { AppError } from "../utils/app-error.js";
export class ResumeOptimizerService {
    async generateTailoredResume(userId, jobId) {
        const [profile, job] = await Promise.all([
            UserProfileModel.findOne({ userId }).lean(),
            JobModel.findById(jobId).lean(),
        ]);
        if (!profile || !job) {
            throw AppError.notFound("Profile or job not found");
        }
        // Extract ATS keywords from the job description
        const jdKeywords = this.extractJDKeywords(job.description);
        const atsKeywords = [
            ...new Set([...job.matchedSkills, ...jdKeywords]),
        ];
        const latex = this.buildRefinedResume(profile, job, atsKeywords);
        const atsSuggestions = this.generateAtsSuggestions(profile, job, atsKeywords);
        const document = await GeneratedDocumentModel.create({
            userId,
            jobId,
            type: "resume",
            title: `Tailored Resume - ${job.company} - ${job.title}`,
            content: latex,
            metadata: {
                atsSuggestions,
                atsKeywordsInjected: atsKeywords,
            },
        });
        return {
            documentId: document._id,
            latex,
            atsSuggestions,
            atsKeywordsInjected: atsKeywords,
        };
    }
    /** Pull meaningful terms from a JD string. */
    extractJDKeywords(description) {
        const tokens = description
            .toLowerCase()
            .replace(/[^a-z0-9#+.\-/\s]/g, " ")
            .split(/[\s,;|]+/)
            .map((t) => t.trim())
            .filter((t) => t.length > 1);
        const stopWords = new Set([
            "and", "the", "for", "with", "from", "that", "this",
            "are", "was", "will", "has", "have", "not", "but",
            "all", "can", "had", "her", "one", "our", "out",
            "you", "been", "each", "make", "like", "into",
            "year", "years", "experience", "strong", "ability",
            "work", "team", "role", "good", "etc", "must",
            "including", "preferred", "required", "such",
            "full-time", "full", "time",
        ]);
        return [...new Set(tokens.filter((t) => !stopWords.has(t)))];
    }
    /** Generate actionable ATS suggestions specific to this job. */
    generateAtsSuggestions(profile, job, atsKeywords) {
        const suggestions = [];
        // Find keywords the candidate is missing
        const profileSkillsLower = new Set(profile.skills.map((s) => s.toLowerCase()));
        const missing = job.missingSkills.filter((s) => !profileSkillsLower.has(s.toLowerCase()));
        if (missing.length > 0) {
            suggestions.push(`Consider adding these JD keywords if you have exposure: ${missing.join(", ")}.`);
        }
        suggestions.push(`ATS keywords injected into your resume: ${atsKeywords.slice(0, 10).join(", ")}. Ensure they appear naturally.`);
        suggestions.push("Quantify achievements — e.g. 'reduced latency by 40%' or 'served 1M+ requests/day'.");
        suggestions.push(`Tailor your summary to emphasise ${job.title}-relevant skills over generic ones.`);
        if (profile.certifications.length > 0) {
            suggestions.push(`Your certifications (${profile.certifications.join(", ")}) are included — they boost ATS score for ${job.company}.`);
        }
        return suggestions;
    }
    /**
     * Refine the user's EXISTING resume by:
     * - Reordering skills to front-load JD-matched ones
     * - Injecting ATS keywords into the summary
     * - Prioritising relevant projects/experience
     * - Keeping all original content intact
     */
    buildRefinedResume(profile, job, atsKeywords) {
        const atsSet = new Set(atsKeywords.map((k) => k.toLowerCase()));
        // Reorder skills: matched first, then rest
        const matchedSkills = profile.skills.filter((s) => atsSet.has(s.toLowerCase()));
        const otherSkills = profile.skills.filter((s) => !atsSet.has(s.toLowerCase()));
        const orderedSkills = [...matchedSkills, ...otherSkills];
        // Build ATS-optimised summary from job-relevant skills
        const topSkills = matchedSkills.length > 0
            ? matchedSkills.slice(0, 6)
            : orderedSkills.slice(0, 6);
        const summaryLine = `Results-driven professional with hands-on expertise in ${topSkills.join(", ")}. Seeking to leverage these competencies as a ${job.title} at ${job.company}. Proven ability to deliver scalable solutions in ${atsKeywords.slice(0, 3).join(", ")} environments.`;
        // Rank projects by relevance to JD
        const rankedProjects = [...profile.projects].sort((a, b) => {
            const aScore = (a.technologies ?? []).filter((t) => atsSet.has(t.toLowerCase())).length;
            const bScore = (b.technologies ?? []).filter((t) => atsSet.has(t.toLowerCase())).length;
            return bScore - aScore;
        });
        // Rank experience by relevance to JD
        const rankedExperience = [...profile.experience].sort((a, b) => {
            const aText = `${a.title} ${a.summary}`.toLowerCase();
            const bText = `${b.title} ${b.summary}`.toLowerCase();
            const aScore = atsKeywords.filter((k) => aText.includes(k)).length;
            const bScore = atsKeywords.filter((k) => bText.includes(k)).length;
            return bScore - aScore;
        });
        const esc = (s) => s.replace(/[&%$#_{}~^\\]/g, (m) => `\\${m}`);
        const projectSection = rankedProjects
            .map((p) => {
            const techs = (p.technologies ?? []).join(", ");
            return `\\textbf{${esc(p.name ?? "Project")}} \\hfill \\textit{${esc(techs)}} \\\\\n${esc(p.summary ?? "")}`;
        })
            .join("\n\\vspace{6pt}\n");
        const experienceSection = rankedExperience
            .map((e) => {
            const dates = e.startDate || e.endDate
                ? `${e.startDate ?? ""} -- ${e.endDate ?? "Present"}`
                : "";
            return `\\textbf{${esc(e.title ?? "Role")}} \\hfill ${esc(dates)} \\\\\n\\textit{${esc(e.company ?? "Company")}} \\\\\n${esc(e.summary ?? "")}`;
        })
            .join("\n\\vspace{6pt}\n");
        const educationSection = profile.education
            .map((e) => {
            const dates = e.startDate || e.endDate
                ? `${e.startDate ?? ""} -- ${e.endDate ?? ""}`
                : "";
            return `\\textbf{${esc(e.degree ?? "Degree")}} \\hfill ${esc(dates)} \\\\\n\\textit{${esc(e.institution ?? "Institution")}}`;
        })
            .join("\n\\vspace{4pt}\n");
        const certSection = profile.certifications.length > 0
            ? `\\section*{Certifications}\n${profile.certifications.map((c) => esc(c)).join(" \\textbullet\\ ")}`
            : "";
        return `\\documentclass[10pt]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\begin{document}

%% ---- HEADER ----
\\begin{center}
{\\LARGE \\textbf{${esc(profile.name)}}} \\\\[4pt]
\\textit{Applying for: ${esc(job.title)} at ${esc(job.company)}}
\\end{center}

\\vspace{-6pt}
\\rule{\\textwidth}{0.4pt}

%% ---- PROFESSIONAL SUMMARY (ATS-optimised) ----
\\section*{Professional Summary}
${esc(summaryLine)}

%% ---- SKILLS (JD-matched first) ----
\\section*{Technical Skills}
${orderedSkills.map((s) => esc(s)).join(" \\textbullet\\ ")}

%% ---- EXPERIENCE (ranked by JD relevance) ----
\\section*{Professional Experience}
${experienceSection}

%% ---- PROJECTS (ranked by JD relevance) ----
\\section*{Projects}
${projectSection}

%% ---- EDUCATION ----
\\section*{Education}
${educationSection}

${certSection}

\\end{document}`;
    }
}
//# sourceMappingURL=resume-optimizer.service.js.map