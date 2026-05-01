import { AutoApplyService } from "../services/auto-apply.service.js";
import { asyncHandler } from "../utils/async-handler.js";
const autoApplyService = new AutoApplyService();
export const applyJob = asyncHandler(async (request, response) => {
    const application = await autoApplyService.requestApplication({
        userId: request.user.sub,
        jobId: request.body.jobId,
        manualOverride: request.body.manualOverride,
    });
    response.json({ application });
});
//# sourceMappingURL=apply.controller.js.map