import { JobModel } from "../models/Job.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { DashboardService } from "../services/dashboard.service.js";
import { JobAggregationService } from "../services/job-aggregation.service.js";
import { JobMatchingService } from "../services/job-matching.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const aggregationService = new JobAggregationService();
const matchingService = new JobMatchingService();
const dashboardService = new DashboardService();

export const fetchJobs = asyncHandler(async (request, response) => {
  const jobs = await aggregationService.fetchForUser(request.user!.sub);
  response.json({ jobs });
});

export const matchJobs = asyncHandler(async (request, response) => {
  const profile = await UserProfileModel.findOne({ userId: request.user!.sub });
  const jobs = await JobModel.find({ sourceUserId: request.user!.sub });

  const matches = jobs.map((job) => ({
    jobId: job._id,
    title: job.title,
    company: job.company,
    ...matchingService.match(profile?.skills ?? [], job.description),
  }));

  response.json({ matches });
});

export const listJobs = asyncHandler(async (request, response) => {
  const status =
    typeof request.query.status === "string" ? request.query.status : undefined;
  const jobs = await JobModel.find({
    sourceUserId: request.user!.sub,
    ...(status ? { status } : {}),
  }).sort({ relevanceScore: -1, createdAt: -1 });

  response.json({ jobs });
});

export const dashboard = asyncHandler(async (request, response) => {
  const data = await dashboardService.getDashboard(request.user!.sub);
  response.json(data);
});
