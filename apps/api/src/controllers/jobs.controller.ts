import { JobModel } from "../models/Job.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { DashboardService } from "../services/dashboard.service.js";
import { JobAggregationService } from "../services/job-aggregation.service.js";
import { JobLinkValidatorService } from "../services/job-link-validator.service.js";
import { JobMatchingService } from "../services/job-matching.service.js";
import { sortJobsByPriority } from "../services/job-ranking.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";

const aggregationService = new JobAggregationService();
const matchingService = new JobMatchingService();
const dashboardService = new DashboardService();
const linkValidator = new JobLinkValidatorService();

export const fetchJobs = asyncHandler(async (request, response) => {
  const jobs = await aggregationService.fetchForUser(request.user!.sub);
  response.json({
    jobs,
    sourceMode: aggregationService.sourceMode,
    isMockData: aggregationService.sourceMode === "mock",
  });
});

export const matchJobs = asyncHandler(async (request, response) => {
  const profile = await UserProfileModel.findOne({ userId: request.user!.sub });
  const jobs = await JobModel.find({ sourceUserId: request.user!.sub });

  const matches = await Promise.all(
    jobs.map(async (job) => ({
      jobId: job._id,
      title: job.title,
      company: job.company,
      ...(await matchingService.match(profile?.skills ?? [], job.description)),
    })),
  );

  response.json({ matches });
});

export const listJobs = asyncHandler(async (request, response) => {
  const status =
    typeof request.query.status === "string" ? request.query.status : undefined;
  const platforms =
    typeof request.query.platform === "string"
      ? request.query.platform
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
  const showAll = request.query.showAll === "true";
  const tags =
    typeof request.query.tags === "string"
      ? request.query.tags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
  const skills =
    typeof request.query.skills === "string"
      ? request.query.skills
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean)
      : [];
  const location =
    typeof request.query.location === "string"
      ? request.query.location.trim()
      : "";

  const filter: Record<string, unknown> = {
    sourceUserId: request.user!.sub,
    ...(status ? { status } : {}),
    ...(platforms.length > 0 ? { platform: { $in: platforms } } : {}),
    ...(tags.length > 0 ? { categoryTags: { $in: tags } } : {}),
    ...(skills.length > 0 ? { extractedSkills: { $in: skills } } : {}),
    ...(location
      ? {
          location: {
            $regex: location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        }
      : {}),
  };

  // By default, hide jobs with invalid links. Show unchecked ones (pending validation).
  if (!showAll) {
    filter.linkStatus = "valid";
    filter.isProfileFit = true;
  }

  const jobs = sortJobsByPriority(await JobModel.find(filter));

  response.json({
    jobs,
    sourceMode: aggregationService.sourceMode,
    isMockData: aggregationService.sourceMode === "mock",
  });
});

export const updateJobStatus = asyncHandler(async (request, response) => {
  const job = await JobModel.findOneAndUpdate(
    {
      _id: request.params.jobId,
      sourceUserId: request.user!.sub,
    },
    { status: request.body.status },
    { new: true },
  );

  if (!job) {
    throw AppError.notFound("Job not found");
  }

  response.json({ job });
});

export const validateLinks = asyncHandler(async (request, response) => {
  const result = await linkValidator.validateJobsForUser(request.user!.sub);
  response.json(result);
});

export const dashboard = asyncHandler(async (request, response) => {
  const data = await dashboardService.getDashboard(request.user!.sub);
  response.json(data);
});
