import multer from "multer";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { ResumeOptimizerService } from "../services/resume-optimizer.service.js";
import { ResumeParserService } from "../services/resume-parser.service.js";
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

  const parsed = await parserService.parseAndStore(
    request.user!.sub,
    request.file,
  );
  response.status(StatusCodes.CREATED).json(parsed);
});

export const generateResume = asyncHandler(async (request, response) => {
  const result = await optimizerService.generateTailoredResume(
    request.user!.sub,
    request.body.jobId,
  );
  response.json(result);
});

export const sampleResumeOutput = asyncHandler(async (_request, response) => {
  response.json(parserService.sampleOutput());
});
