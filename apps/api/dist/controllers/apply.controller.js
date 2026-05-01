import { AutoApplyService } from "../services/auto-apply.service.js";
import { asyncHandler } from "../utils/async-handler.js";
const autoApplyService = new AutoApplyService();
export const applyJob = asyncHandler(async (request, response) => {
    const result = await autoApplyService.requestApplication({
        userId: request.user.sub,
        jobId: request.body.jobId,
        manualOverride: request.body.manualOverride,
    });
    response.json(result);
});
export const confirmApplication = asyncHandler(async (request, response) => {
    const result = await autoApplyService.confirmApplication({
        userId: request.user.sub,
        jobId: request.body.jobId,
        applicationData: request.body.applicationData,
    });
    response.json(result);
});
//# sourceMappingURL=apply.controller.js.map