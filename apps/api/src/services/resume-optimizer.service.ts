import { GeneratedDocumentModel } from "../models/GeneratedDocument.js";
import { JobModel } from "../models/Job.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { AppError } from "../utils/app-error.js";

type ResumeProfile = {
  name: string;
  skills: string[];
  projects: Array<{ name?: string; summary?: string; technologies?: string[] }>;
  experience: Array<{ title?: string; company?: string; summary?: string }>;
  education: Array<{ degree?: string; institution?: string }>;
};

type ResumeJob = {
  _id: string;
  company: string;
  title: string;
};

export class ResumeOptimizerService {
  async generateTailoredResume(userId: string, jobId: string) {
    const [profile, job] = await Promise.all([
      UserProfileModel.findOne({ userId }).lean<ResumeProfile | null>(),
      JobModel.findById(jobId).lean<ResumeJob | null>(),
    ]);

    if (!profile || !job) {
      throw AppError.notFound("Profile or job not found");
    }

    const latex = this.buildLatexResume(profile, job);
    const atsSuggestions = [
      "Mirror the exact role keywords from the job description in the summary.",
      "Quantify impact in at least three bullet points.",
      "Move the most relevant project above less relevant experience.",
    ];

    const document = await GeneratedDocumentModel.create({
      userId,
      jobId,
      type: "resume",
      title: `Tailored Resume - ${job.company}`,
      content: latex,
      metadata: {
        atsSuggestions,
        pdfPath: `/generated/${job._id}-resume.pdf`,
      },
    });

    return {
      latex,
      atsSuggestions,
      downloadUrl: document.metadata.pdfPath,
    };
  }

  private buildLatexResume(profile: ResumeProfile, job: ResumeJob) {
    const projectSection = profile.projects
      .map(
        (project) =>
          `\\textbf{${project.name ?? "Project"}} \\\\ ${project.summary ?? ""} \\\\ Technologies: ${(project.technologies ?? []).join(", ")}`,
      )
      .join("\\vspace{6pt}");

    return String.raw`
\documentclass[10pt]{article}
\usepackage[margin=0.6in]{geometry}
\begin{document}
\begin{center}
{\LARGE ${profile.name}}\\
Target Role: ${job.title} at ${job.company}
\end{center}
\section*{Summary}
Engineer with strengths in ${profile.skills.slice(0, 6).join(", ")} aligned to ${job.title} requirements.
\section*{Skills}
${profile.skills.join(", ")}
\section*{Projects}
${projectSection}
\section*{Experience}
${profile.experience.map((item) => `${item.title ?? "Role"} - ${item.company ?? "Company"}\\ ${item.summary ?? ""}`).join("\\vspace{6pt}")}
\section*{Education}
${profile.education.map((item) => `${item.degree ?? "Degree"} - ${item.institution ?? "Institution"}`).join("\\")}
\end{document}`;
  }
}
