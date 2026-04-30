import { HrDiscoveryService } from "../services/hr-discovery.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const hrService = new HrDiscoveryService();

export const findHr = asyncHandler(async (request, response) => {
  const leads = await hrService.discover(request.user!.sub, request.body.jobId);
  response.json({ leads });
});

export const updateLeadState = asyncHandler(async (request, response) => {
  const lead = await hrService.updateState(
    request.user!.sub,
    request.body.leadId,
    request.body.state,
  );
  response.json({ lead });
});
