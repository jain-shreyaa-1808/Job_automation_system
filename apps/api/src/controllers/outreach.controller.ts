import { OutreachService } from "../services/outreach.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const outreachService = new OutreachService();

export const generateOutreach = asyncHandler(async (request, response) => {
  const result = await outreachService.generate(
    request.user!.sub,
    request.body.jobId,
    request.body.recruiterLeadId,
  );
  response.json(result);
});

export const generateOutreachFromDescription = asyncHandler(
  async (request, response) => {
    const result = await outreachService.generateFromDescription(
      request.user!.sub,
      request.body,
    );
    response.json(result);
  },
);
