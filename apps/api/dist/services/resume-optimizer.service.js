import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { GeneratedDocumentModel } from "../models/GeneratedDocument.js";
import { JobModel } from "../models/Job.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { AppError } from "../utils/app-error.js";
import { AiChatService } from "./ai-chat.service.js";
export class ResumeOptimizerService {
    aiChatService = new AiChatService();
    async generateTailoredResume(userId, jobId) {
        const [profile, job] = await Promise.all([
            UserProfileModel.findOne({ userId }).lean(),
            JobModel.findById(jobId).lean(),
        ]);
        if (!profile || !job) {
            throw AppError.notFound("Profile or job not found");
        }
        const jdKeywords = this.extractJDKeywords(job.description);
        const atsKeywords = [...new Set([...job.matchedSkills, ...jdKeywords])];
        const heuristicRenderData = this.buildResumeRenderData(profile, job, atsKeywords);
        const renderData = await this.refineRenderDataWithModel(profile, job, heuristicRenderData, atsKeywords);
        const latex = this.buildRefinedResume(profile, job, renderData);
        const pdfBytes = await this.buildPdfResume(profile, job, renderData);
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
                pdfBase64: Buffer.from(pdfBytes).toString("base64"),
            },
        });
        return {
            documentId: document._id,
            latex,
        };
    }
    async refineRenderDataWithModel(profile, job, renderData, atsKeywords) {
        if (!this.aiChatService.isConfigured()) {
            return renderData;
        }
        try {
            const response = await this.aiChatService.completeJson([
                {
                    role: "system",
                    content: "You improve ATS-focused resume render data. Return valid JSON with keys summaryLine and orderedSkills. Keep summaryLine under 220 characters, factual, professional, and aligned to the job. orderedSkills must be a concise ordered list of lowercase or title-case skill names already present in the candidate profile. Do not invent new skills.",
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        profile,
                        job,
                        atsKeywords,
                        renderData,
                    }),
                },
            ]);
            const summaryLine = typeof response.summaryLine === "string" &&
                response.summaryLine.trim().length > 0
                ? this.limitText(this.normalizeSentence(response.summaryLine), 220)
                : renderData.summaryLine;
            const orderedSkills = Array.isArray(response.orderedSkills)
                ? [...new Set(response.orderedSkills)]
                    .filter((item) => typeof item === "string")
                    .map((item) => this.normalizeListItem(item))
                    .filter((item) => item.length > 0)
                    .slice(0, 12)
                : renderData.orderedSkills;
            return {
                ...renderData,
                summaryLine,
                orderedSkills: orderedSkills.length > 0 ? orderedSkills : renderData.orderedSkills,
            };
        }
        catch {
            return renderData;
        }
    }
    extractJDKeywords(description) {
        const tokens = description
            .toLowerCase()
            .replace(/[^a-z0-9#+.\-/\s]/g, " ")
            .split(/[\s,;|]+/)
            .map((token) => token.trim())
            .filter((token) => token.length > 1);
        const stopWords = new Set([
            "and",
            "the",
            "for",
            "with",
            "from",
            "that",
            "this",
            "are",
            "was",
            "will",
            "has",
            "have",
            "not",
            "but",
            "all",
            "can",
            "had",
            "her",
            "one",
            "our",
            "out",
            "you",
            "been",
            "each",
            "make",
            "like",
            "into",
            "year",
            "years",
            "experience",
            "strong",
            "ability",
            "work",
            "team",
            "role",
            "good",
            "etc",
            "must",
            "including",
            "preferred",
            "required",
            "such",
            "full-time",
            "full",
            "time",
        ]);
        return [...new Set(tokens.filter((token) => !stopWords.has(token)))];
    }
    generateAtsSuggestions(profile, job, atsKeywords) {
        const suggestions = [];
        const profileSkillsLower = new Set(profile.skills.map((skill) => skill.toLowerCase()));
        const missing = job.missingSkills.filter((skill) => !profileSkillsLower.has(skill.toLowerCase()));
        if (missing.length > 0) {
            suggestions.push(`Consider adding these JD keywords if you have exposure: ${missing.join(", ")}.`);
        }
        suggestions.push(`ATS keywords injected into your resume: ${atsKeywords.slice(0, 10).join(", ")}. Ensure they appear naturally.`);
        suggestions.push("Quantify achievements with concrete outcomes such as performance gains, revenue impact, or scale.");
        suggestions.push(`Tailor your summary to emphasize ${job.title}-relevant skills over generic statements.`);
        if (profile.certifications.length > 0) {
            suggestions.push(`Your certifications (${profile.certifications.join(", ")}) are included and aligned to ${job.company}.`);
        }
        return suggestions;
    }
    buildResumeRenderData(profile, job, atsKeywords) {
        const atsSet = new Set(atsKeywords.map((keyword) => keyword.toLowerCase()));
        const normalizedSkills = profile.skills
            .map((skill) => this.normalizeListItem(skill))
            .filter(Boolean);
        const matchedSkills = normalizedSkills.filter((skill) => atsSet.has(skill.toLowerCase()));
        const otherSkills = normalizedSkills.filter((skill) => !atsSet.has(skill.toLowerCase()));
        const orderedSkills = [
            ...new Set([...matchedSkills, ...otherSkills]),
        ].slice(0, 12);
        const topSkills = matchedSkills.length > 0
            ? matchedSkills.slice(0, 6)
            : orderedSkills.slice(0, 6);
        const summaryKeywords = atsKeywords.slice(0, 3).join(", ");
        const summaryLine = this.limitText(this.normalizeSentence(`Results-driven engineer with hands-on experience in ${topSkills.join(", ")}. Builds scalable, customer-facing software with strong focus on ${summaryKeywords} and production quality`), 220);
        const targetLine = `${this.normalizeListItem(job.title)} | ${this.normalizeListItem(job.company)}`;
        const rankedProjects = [...profile.projects].sort((left, right) => {
            const leftScore = (left.technologies ?? []).filter((technology) => atsSet.has(technology.toLowerCase())).length;
            const rightScore = (right.technologies ?? []).filter((technology) => atsSet.has(technology.toLowerCase())).length;
            return rightScore - leftScore;
        });
        const rankedExperience = [...profile.experience].sort((left, right) => {
            const leftText = `${left.title ?? ""} ${left.summary ?? ""}`.toLowerCase();
            const rightText = `${right.title ?? ""} ${right.summary ?? ""}`.toLowerCase();
            const leftScore = atsKeywords.filter((keyword) => leftText.includes(keyword.toLowerCase())).length;
            const rightScore = atsKeywords.filter((keyword) => rightText.includes(keyword.toLowerCase())).length;
            return rightScore - leftScore;
        });
        return {
            summaryLine,
            targetLine,
            orderedSkills,
            rankedProjects: rankedProjects.slice(0, 2).map((project) => ({
                ...project,
                name: this.normalizeListItem(project.name ?? "Project"),
                summary: this.limitText(this.normalizeSentence(project.summary ?? ""), 150),
                technologies: (project.technologies ?? [])
                    .map((technology) => this.normalizeListItem(technology))
                    .filter(Boolean)
                    .slice(0, 4),
            })),
            rankedExperience: rankedExperience.slice(0, 2).map((experience) => ({
                ...experience,
                title: this.normalizeListItem(experience.title ?? "Role"),
                company: this.normalizeListItem(experience.company ?? "Company"),
                summary: this.limitText(this.normalizeSentence(experience.summary ?? ""), 180),
            })),
            education: profile.education.slice(0, 1).map((education) => ({
                ...education,
                degree: this.normalizeListItem(education.degree ?? "Degree"),
                institution: this.normalizeListItem(education.institution ?? "Institution"),
            })),
            certifications: profile.certifications
                .map((certification) => this.normalizeListItem(certification))
                .filter(Boolean)
                .slice(0, 3),
        };
    }
    buildRefinedResume(profile, _job, renderData) {
        const escapeLatex = (value) => value.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
        const projectSection = renderData.rankedProjects
            .map((project) => {
            const technologies = (project.technologies ?? []).join(", ");
            const techSuffix = technologies
                ? ` \\hfill \\textit{${escapeLatex(technologies)}}`
                : "";
            return `\\textbf{${escapeLatex(project.name ?? "Project")}}${techSuffix} \\\\
${escapeLatex(project.summary ?? "")}`;
        })
            .join("\n\\vspace{4pt}\n");
        const experienceSection = renderData.rankedExperience
            .map((experience) => {
            const dates = experience.startDate || experience.endDate
                ? `${experience.startDate ?? ""} -- ${experience.endDate ?? "Present"}`
                : "";
            return `\\textbf{${escapeLatex(experience.title ?? "Role")}} \\hfill ${escapeLatex(dates)} \\\\
\\textit{${escapeLatex(experience.company ?? "Company")}} \\\\
${escapeLatex(experience.summary ?? "")}`;
        })
            .join("\n\\vspace{4pt}\n");
        const educationSection = renderData.education
            .map((education) => {
            const dates = education.startDate || education.endDate
                ? `${education.startDate ?? ""} -- ${education.endDate ?? ""}`
                : "";
            return `\\textbf{${escapeLatex(education.degree ?? "Degree")}} \\hfill ${escapeLatex(dates)} \\\\
\\textit{${escapeLatex(education.institution ?? "Institution")}}`;
        })
            .join("\n\\vspace{3pt}\n");
        const certSection = renderData.certifications.length
            ? `\\vspace{-4pt}
\\section*{Certifications}
${renderData.certifications
                .map((certification) => escapeLatex(certification))
                .join(" \\textbullet\\ ")}`
            : "";
        return `\\documentclass[9pt]{article}
\\usepackage[margin=0.42in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{2pt}
\\pagenumbering{gobble}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\Large \\textbf{${escapeLatex(profile.name)}}} \\\\[2pt]
\\textit{${escapeLatex(renderData.targetLine)}}
\\end{center}

\\vspace{-8pt}
\\rule{\\textwidth}{0.4pt}

\\vspace{-8pt}
\\section*{Professional Summary}
${escapeLatex(renderData.summaryLine)}

\\vspace{-4pt}
\\section*{Technical Skills}
${renderData.orderedSkills.map((skill) => escapeLatex(skill)).join(" \\textbullet\\ ")}

\\vspace{-4pt}
\\section*{Professional Experience}
${experienceSection}

\\vspace{-4pt}
\\section*{Projects}
${projectSection}

\\vspace{-4pt}
\\section*{Education}
${educationSection}

${certSection}

\\end{document}`;
    }
    async buildPdfResume(profile, _job, renderData) {
        const pdf = await PDFDocument.create();
        const page = pdf.addPage([612, 792]);
        const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
        const margin = 34;
        const maxWidth = page.getWidth() - margin * 2;
        let cursorY = page.getHeight() - margin;
        const canFit = (requiredHeight) => cursorY - requiredHeight >= margin;
        const drawWrappedText = (text, fontSize = 9, font = regularFont, lineGap = 2) => {
            const lines = this.wrapText(text, font, fontSize, maxWidth);
            for (const line of lines) {
                if (!canFit(fontSize + lineGap)) {
                    return false;
                }
                page.drawText(line, {
                    x: margin,
                    y: cursorY,
                    size: fontSize,
                    font,
                    color: rgb(0.12, 0.14, 0.18),
                });
                cursorY -= fontSize + lineGap;
            }
            return true;
        };
        const drawSectionTitle = (title) => {
            if (!canFit(18)) {
                return false;
            }
            page.drawText(title, {
                x: margin,
                y: cursorY,
                size: 11,
                font: boldFont,
                color: rgb(0.05, 0.08, 0.12),
            });
            cursorY -= 14;
            return true;
        };
        page.drawText(profile.name, {
            x: margin,
            y: cursorY,
            size: 18,
            font: boldFont,
            color: rgb(0.05, 0.08, 0.12),
        });
        cursorY -= 22;
        drawWrappedText(renderData.targetLine, 9);
        cursorY -= 5;
        drawSectionTitle("Professional Summary");
        drawWrappedText(renderData.summaryLine);
        cursorY -= 4;
        drawSectionTitle("Technical Skills");
        drawWrappedText(renderData.orderedSkills.join(" • "));
        cursorY -= 4;
        if (drawSectionTitle("Professional Experience")) {
            for (const item of renderData.rankedExperience) {
                if (!drawWrappedText(item.title ?? "Role", 10, boldFont, 2)) {
                    break;
                }
                const companyLine = [item.company, item.startDate, item.endDate]
                    .filter(Boolean)
                    .join(" | ");
                if (companyLine && !drawWrappedText(companyLine, 8, regularFont, 2)) {
                    break;
                }
                if (item.summary && !drawWrappedText(item.summary, 8, regularFont, 2)) {
                    break;
                }
                cursorY -= 3;
            }
        }
        if (drawSectionTitle("Projects")) {
            for (const item of renderData.rankedProjects) {
                if (!drawWrappedText(item.name ?? "Project", 10, boldFont, 2)) {
                    break;
                }
                if ((item.technologies ?? []).length > 0 &&
                    !drawWrappedText((item.technologies ?? []).join(", "), 8, regularFont, 2)) {
                    break;
                }
                if (item.summary && !drawWrappedText(item.summary, 8, regularFont, 2)) {
                    break;
                }
                cursorY -= 3;
            }
        }
        if (drawSectionTitle("Education")) {
            for (const item of renderData.education) {
                if (!drawWrappedText(item.degree ?? "Degree", 10, boldFont, 2)) {
                    break;
                }
                const educationLine = [item.institution, item.startDate, item.endDate]
                    .filter(Boolean)
                    .join(" | ");
                if (educationLine &&
                    !drawWrappedText(educationLine, 8, regularFont, 2)) {
                    break;
                }
                cursorY -= 3;
            }
        }
        if (renderData.certifications.length > 0 &&
            drawSectionTitle("Certifications")) {
            drawWrappedText(renderData.certifications.join(" • "), 8, regularFont, 2);
        }
        return pdf.save();
    }
    normalizeListItem(value) {
        return value.replace(/\s+/g, " ").trim();
    }
    normalizeSentence(value) {
        const normalized = value.replace(/\s+/g, " ").trim();
        if (!normalized) {
            return normalized;
        }
        const sentence = normalized.charAt(0).toUpperCase() + normalized.slice(1);
        return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
    }
    limitText(value, maxLength) {
        const normalized = value.replace(/\s+/g, " ").trim();
        if (normalized.length <= maxLength) {
            return normalized;
        }
        const truncated = normalized.slice(0, maxLength);
        const lastSpace = truncated.lastIndexOf(" ");
        const safeCutoff = lastSpace > Math.floor(maxLength * 0.6) ? lastSpace : maxLength;
        return `${truncated.slice(0, safeCutoff).trimEnd()}...`;
    }
    wrapText(text, font, fontSize, maxWidth) {
        const words = text.split(/\s+/).filter(Boolean);
        const lines = [];
        let currentLine = "";
        for (const word of words) {
            const nextLine = currentLine ? `${currentLine} ${word}` : word;
            if (font.widthOfTextAtSize(nextLine, fontSize) <= maxWidth) {
                currentLine = nextLine;
                continue;
            }
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines;
    }
}
//# sourceMappingURL=resume-optimizer.service.js.map