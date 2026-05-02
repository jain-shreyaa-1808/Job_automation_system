import multer from "multer";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { ResumeOptimizerService } from "../services/resume-optimizer.service.js";
import { ResumeParserService } from "../services/resume-parser.service.js";
import { GeneratedDocumentModel } from "../models/GeneratedDocument.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { asyncHandler } from "../utils/async-handler.js";
export const resumeUpload = multer({
    dest: env.RESUME_STORAGE_DIR,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
const parserService = new ResumeParserService();
const optimizerService = new ResumeOptimizerService();
export const parseResume = asyncHandler(async (request, response) => {
    if (!request.file) {
        response
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Resume file is required" });
        return;
    }
    const parsed = await parserService.parseAndStore(request.user.sub, request.file);
    response.status(StatusCodes.CREATED).json(parsed);
});
/** GET /resume/profile — return the persisted resume profile for current user */
export const getResumeProfile = asyncHandler(async (request, response) => {
    const profile = await UserProfileModel.findOne({
        userId: request.user.sub,
    }).lean();
    if (!profile) {
        response.json({
            hasResume: false,
            resumeFileName: null,
            name: null,
            skills: [],
            experience: [],
            projects: [],
            education: [],
            certifications: [],
            resumeScore: null,
            updatedAt: null,
        });
        return;
    }
    response.json({
        hasResume: true,
        resumeFileName: profile.resumeFileName ?? null,
        name: profile.name,
        skills: profile.skills,
        experience: profile.experience,
        projects: profile.projects,
        education: profile.education,
        certifications: profile.certifications,
        resumeScore: profile.resumeScore,
        updatedAt: profile.updatedAt,
    });
});
/** PUT /resume/profile — update the resume by re-uploading (replaces old one) */
export const updateResume = asyncHandler(async (request, response) => {
    if (!request.file) {
        response
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Resume file is required" });
        return;
    }
    const parsed = await parserService.parseAndStore(request.user.sub, request.file);
    response.json({ message: "Resume updated successfully", ...parsed });
});
export const generateResume = asyncHandler(async (request, response) => {
    const result = await optimizerService.generateTailoredResume(request.user.sub, request.body.jobId);
    response.json(result);
});
export const downloadResumePdf = asyncHandler(async (request, response) => {
    const doc = await GeneratedDocumentModel.findById(request.params.id).lean();
    if (!doc || doc.userId.toString() !== request.user.sub) {
        response
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Document not found" });
        return;
    }
    const pdfBase64 = doc.metadata?.pdfBase64;
    if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
        response
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "PDF resume not found" });
        return;
    }
    const filename = (doc.title ?? "resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
    response.send(Buffer.from(pdfBase64, "base64"));
});
export const sampleResumeOutput = asyncHandler(async (_request, response) => {
    response.json(parserService.sampleOutput());
});
//# sourceMappingURL=resume.controller.js.map