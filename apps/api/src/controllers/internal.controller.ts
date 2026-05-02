import { UserModel } from "../models/User.js";
import { JobAggregationService } from "../services/job-aggregation.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const aggregationService = new JobAggregationService();

export const refreshAllJobs = asyncHandler(async (_request, response) => {
  const users = await UserModel.find({}, { _id: 1 }).lean();

  const results = await Promise.allSettled(
    users.map((user) => aggregationService.fetchForUser(user._id.toString())),
  );

  response.json({
    totalUsers: users.length,
    refreshedUsers: results.filter((result) => result.status === "fulfilled")
      .length,
    failedUsers: results.filter((result) => result.status === "rejected")
      .length,
  });
});
