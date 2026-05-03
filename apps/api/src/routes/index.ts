import { Router } from "express";

import {
  applyJob,
  confirmApplication,
} from "../controllers/apply.controller.js";
import { login, me, signup } from "../controllers/auth.controller.js";
import {
  findHr,
  findHrByDomain,
  updateLeadState,
} from "../controllers/hr.controller.js";
import { refreshAllJobs } from "../controllers/internal.controller.js";
import {
  dashboard,
  fetchJobs,
  listJobs,
  matchJobs,
  updateJobStatus,
  validateLinks,
} from "../controllers/jobs.controller.js";
import {
  generateOutreach,
  generateOutreachFromDescription,
} from "../controllers/outreach.controller.js";
import {
  generateResume,
  getResumeProfile,
  parseResume,
  resumeUpload,
  downloadResumePdf,
  sampleResumeOutput,
  updateResume,
} from "../controllers/resume.controller.js";
import { getSalaryInsight } from "../controllers/salary.controller.js";
import { updateSettings } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireInternalToken } from "../middleware/internal-auth.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, signupSchema } from "../validators/auth.validator.js";
import {
  applyJobSchema,
  hrFindSchema,
  hrFindByDomainSchema,
  leadStateSchema,
  outreachFromDescriptionSchema,
  outreachSchema,
  resumeGenerateSchema,
  salarySchema,
  updateJobStatusSchema,
} from "../validators/job.validator.js";
import { settingsSchema } from "../validators/settings.validator.js";

export const apiRouter = Router();

apiRouter.post("/auth/signup", validateBody(signupSchema), signup);
apiRouter.post("/auth/login", validateBody(loginSchema), login);
apiRouter.get("/resume/sample-output", sampleResumeOutput);
apiRouter.post("/internal/jobs/refresh", requireInternalToken, refreshAllJobs);

apiRouter.use(requireAuth);

apiRouter.get("/auth/me", me);
apiRouter.put("/settings", validateBody(settingsSchema), updateSettings);
apiRouter.post("/parse-resume", resumeUpload.single("resume"), parseResume);
apiRouter.get("/resume/profile", getResumeProfile);
apiRouter.put("/resume/update", resumeUpload.single("resume"), updateResume);
apiRouter.post("/jobs/fetch", fetchJobs);
apiRouter.get("/jobs", listJobs);
apiRouter.patch(
  "/jobs/:jobId/status",
  validateBody(updateJobStatusSchema),
  updateJobStatus,
);
apiRouter.post("/jobs/match", matchJobs);
apiRouter.post("/jobs/validate-links", validateLinks);
apiRouter.get("/dashboard", dashboard);
apiRouter.post(
  "/resume/generate",
  validateBody(resumeGenerateSchema),
  generateResume,
);
apiRouter.get("/resume/download/:id", downloadResumePdf);
apiRouter.post("/apply/job", validateBody(applyJobSchema), applyJob);
apiRouter.post("/apply/confirm", confirmApplication);
apiRouter.post("/hr/find", validateBody(hrFindSchema), findHr);
apiRouter.post(
  "/hr/find-by-domain",
  validateBody(hrFindByDomainSchema),
  findHrByDomain,
);
apiRouter.patch("/hr/state", validateBody(leadStateSchema), updateLeadState);
apiRouter.post(
  "/outreach/generate",
  validateBody(outreachSchema),
  generateOutreach,
);
apiRouter.post(
  "/outreach/generate-from-description",
  validateBody(outreachFromDescriptionSchema),
  generateOutreachFromDescription,
);
apiRouter.post(
  "/salary/intelligence",
  validateBody(salarySchema),
  getSalaryInsight,
);
