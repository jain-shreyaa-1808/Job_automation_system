import { SalaryIntelligenceService } from "../services/salary-intelligence.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const salaryService = new SalaryIntelligenceService();

export const getSalaryInsight = asyncHandler(async (request, response) => {
  const insight = salaryService.generate(
    request.body.currentCtc,
    request.body.expectedCtc,
    request.body.preferredRoles,
  );

  response.json(insight);
});
