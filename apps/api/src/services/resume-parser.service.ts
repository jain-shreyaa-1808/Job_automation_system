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

    return {
      name,
      skills,
      projects: this.extractProjects(lines, skills),
      experience: this.extractExperience(lines),
      education: this.extractEducation(lines),
      certifications: this.extractSection(lines, /certification|certificate/i),
      parsedText: text,
      resumeScore: Math.min(100, 45 + skills.length * 5),
    };
  }

  private extractProjects(lines: string[], skills: string[]) {
    const projectLines = lines
      .filter((line) => /project/i.test(line))
      .slice(0, 3);

    return projectLines.map((line, index) => ({
      name: line.replace(/project:?/i, "").trim() || `Project ${index + 1}`,
      summary: line,
      technologies: skills.slice(0, 4),
    }));
  }

  private extractExperience(lines: string[]) {
    return lines
      .filter((line) => /engineer|intern|consultant|developer|tac/i.test(line))
      .slice(0, 3)
      .map((line) => ({
        company: line.split("-")[0]?.trim() || "Company",
        title: line,
        startDate: "",
        endDate: "",
        summary: line,
      }));
  }

  private extractEducation(lines: string[]) {
    return lines
      .filter((line) =>
        /b\.e|btech|b\.tech|m\.tech|degree|university|college/i.test(line),
      )
      .slice(0, 2)
      .map((line) => ({
        institution: line,
        degree: line,
        startDate: "",
        endDate: "",
      }));
  }

  private extractSection(lines: string[], pattern: RegExp): string[] {
    return lines.filter((line) => pattern.test(line)).slice(0, 5);
  }
}
