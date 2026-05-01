import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import { env } from "../config/env.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { extractSkills } from "../utils/skill-normalizer.js";

type ParsedResume = {
  name: string;
  skills: string[];
  projects: Array<{ name: string; summary: string; technologies: string[] }>;
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    summary: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: string[];
  parsedText: string;
  resumeScore: number;
};

export class ResumeParserService {
  async parseAndStore(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ParsedResume> {
    await mkdir(env.RESUME_STORAGE_DIR, { recursive: true });

    const parsedText = await this.extractText(file.path, file.mimetype);
    const parsedResume = this.structureResume(parsedText);

    await UserProfileModel.findOneAndUpdate(
      { userId },
      {
        userId,
        ...parsedResume,
        resumeFileName: file.originalname,
        resumeStoragePath: file.path,
      },
      { upsert: true, new: true },
    );

    return parsedResume;
  }

  sampleOutput() {
    return {
      name: "Aarav Sharma",
      skills: ["react", "typescript", "node.js", "mongodb", "networking"],
      projects: [
        {
          name: "Campus Placement Portal",
          summary:
            "Built a full-stack portal with React and Node.js for campus hiring workflows.",
          technologies: ["react", "node.js", "mongodb"],
        },
      ],
      experience: [
        {
          company: "Cisco TAC Intern",
          title: "Technical Support Intern",
          startDate: "2025-01",
          endDate: "2025-06",
          summary:
            "Assisted in triaging enterprise wireless incidents and documenting RCA steps.",
        },
      ],
      education: [
        {
          institution: "VTU",
          degree: "B.E. Computer Science",
          startDate: "2021",
          endDate: "2025",
        },
      ],
      certifications: ["CCNA", "AWS Cloud Practitioner"],
      parsedText: "Sample parsed text omitted for brevity.",
      resumeScore: 84,
    };
  }

  private async extractText(
    filePath: string,
    mimeType: string,
  ): Promise<string> {
    const buffer = await readFile(filePath);

    if (mimeType.includes("pdf")) {
      const parsed = await pdfParse(buffer);
      return parsed.text;
    }

    if (
      mimeType.includes("word") ||
      path.extname(filePath).toLowerCase() === ".docx"
    ) {
      const parsed = await mammoth.extractRawText({ buffer });
      return parsed.value;
    }

    return buffer.toString("utf8");
  }

  private structureResume(text: string): ParsedResume {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const skills = extractSkills(text);
    const name = lines[0] ?? "Unknown Candidate";

    // Split text into sections by common resume headers
    const sections = this.splitSections(lines);

    return {
      name,
      skills,
      projects: this.extractProjects(sections.projects ?? sections.all, skills),
      experience: this.extractExperience(sections.experience ?? sections.all),
      education: this.extractEducation(sections.education ?? sections.all),
      certifications: this.extractCertifications(
        sections.certification ?? sections.all,
      ),
      parsedText: text,
      resumeScore: Math.min(100, 45 + skills.length * 5),
    };
  }

  private splitSections(lines: string[]) {
    const sectionHeaders: Record<string, RegExp> = {
      experience: /^(experience|work\s*experience|employment)/i,
      projects: /^(projects?|personal\s*projects?)/i,
      education: /^(education|academic)/i,
      skills: /^(technical\s*skills?|skills?|core\s*competenc)/i,
      certification: /^(certification|certificate|licenses)/i,
    };

    const sections: Record<string, string[]> = { all: lines };
    let currentSection = "all";

    for (const line of lines) {
      let matched = false;
      for (const [key, pattern] of Object.entries(sectionHeaders)) {
        if (pattern.test(line)) {
          currentSection = key;
          sections[key] = sections[key] ?? [];
          matched = true;
          break;
        }
      }
      if (!matched && currentSection !== "all") {
        sections[currentSection] = sections[currentSection] ?? [];
        sections[currentSection].push(line);
      }
    }

    return sections;
  }

  private extractProjects(lines: string[], skills: string[]) {
    const projects: Array<{
      name: string;
      summary: string;
      technologies: string[];
    }> = [];
    let currentProject: { name: string; bullets: string[] } | null = null;

    for (const line of lines) {
      // Project title lines typically contain | or tech stack separators
      if (/\|/.test(line) && !/^–/.test(line)) {
        if (currentProject) {
          projects.push({
            name: currentProject.name,
            summary: currentProject.bullets.join(" "),
            technologies: skills
              .filter(
                (s) =>
                  currentProject!.name.toLowerCase().includes(s) ||
                  currentProject!.bullets.some((b) =>
                    b.toLowerCase().includes(s),
                  ),
              )
              .slice(0, 6),
          });
        }
        currentProject = { name: line.split("|")[0].trim(), bullets: [] };
      } else if (/^[–\-•]/.test(line) && currentProject) {
        currentProject.bullets.push(line.replace(/^[–\-•]\s*/, ""));
      }
    }

    if (currentProject) {
      projects.push({
        name: currentProject.name,
        summary: currentProject.bullets.join(" "),
        technologies: skills
          .filter(
            (s) =>
              currentProject!.name.toLowerCase().includes(s) ||
              currentProject!.bullets.some((b) => b.toLowerCase().includes(s)),
          )
          .slice(0, 6),
      });
    }

    // Fallback to old method if nothing found
    if (projects.length === 0) {
      return lines
        .filter((line) => /\|/.test(line))
        .slice(0, 3)
        .map((line) => ({
          name: line.split("|")[0].trim(),
          summary: line,
          technologies: skills.slice(0, 4),
        }));
    }

    return projects.slice(0, 5);
  }

  private extractExperience(lines: string[]) {
    const experiences: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate: string;
      summary: string;
    }> = [];
    let current: {
      company: string;
      title: string;
      startDate: string;
      endDate: string;
      bullets: string[];
    } | null = null;

    for (const line of lines) {
      // Company lines often have date ranges
      const dateMatch = line.match(
        /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4})\s*[–\-]\s*(Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4})/i,
      );
      if (dateMatch) {
        if (current) {
          experiences.push({
            ...current,
            summary: current.bullets.join(" "),
          });
        }
        const companyTitle = line.replace(dateMatch[0], "").trim();
        current = {
          company: companyTitle,
          title: "",
          startDate: dateMatch[1],
          endDate: dateMatch[2],
          bullets: [],
        };
      } else if (
        /engineer|intern|developer|consultant|manager/i.test(line) &&
        current &&
        !current.title
      ) {
        current.title = line;
      } else if (/^[–\-•]/.test(line) && current) {
        current.bullets.push(line.replace(/^[–\-•]\s*/, ""));
      }
    }

    if (current) {
      experiences.push({
        ...current,
        summary: current.bullets.join(" "),
      });
    }

    // Fallback
    if (experiences.length === 0) {
      return lines
        .filter((line) => /engineer|intern|consultant|developer/i.test(line))
        .slice(0, 3)
        .map((line) => ({
          company: line.split("–")[0]?.split("-")[0]?.trim() || "Company",
          title: line,
          startDate: "",
          endDate: "",
          summary: line,
        }));
    }

    return experiences.slice(0, 5);
  }

  private extractEducation(lines: string[]) {
    const educations: Array<{
      institution: string;
      degree: string;
      startDate: string;
      endDate: string;
    }> = [];

    for (const line of lines) {
      if (/university|college|institute|igdtuw/i.test(line)) {
        const dateMatch = line.match(
          /((?:Aug|Sep|Jan|May)\w*\s+\d{4})\s*[–\-]\s*((?:May|Jun|Jul|Aug|Present)\w*\s+\d{4})/i,
        );
        educations.push({
          institution: line.replace(dateMatch?.[0] ?? "", "").trim(),
          degree: "",
          startDate: dateMatch?.[1] ?? "",
          endDate: dateMatch?.[2] ?? "",
        });
      } else if (
        /\b(B\.?S\.?c|M\.?C\.?A|B\.?E|B\.?Tech|M\.?Tech|B\.?Sc|M\.?Sc|GPA|degree)/i.test(
          line,
        ) &&
        educations.length > 0
      ) {
        educations[educations.length - 1].degree = line;
      }
    }

    if (educations.length === 0) {
      return lines
        .filter((line) =>
          /university|college|degree|b\.e|btech|m\.tech/i.test(line),
        )
        .slice(0, 2)
        .map((line) => ({
          institution: line,
          degree: line,
          startDate: "",
          endDate: "",
        }));
    }

    return educations.slice(0, 3);
  }

  private extractCertifications(lines: string[]): string[] {
    return lines
      .filter(
        (line) =>
          /^[•\-–]/.test(line) || /certified|ccna|ccnp|aws|azure/i.test(line),
      )
      .map((line) => line.replace(/^[•\-–]\s*/, "").trim())
      .filter((line) => line.length > 3)
      .slice(0, 5);
  }

  private extractSection(lines: string[], pattern: RegExp): string[] {
    return lines.filter((line) => pattern.test(line)).slice(0, 5);
  }
}
