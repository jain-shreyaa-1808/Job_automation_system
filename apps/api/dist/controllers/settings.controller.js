import { UserSettingsService } from "../services/user-settings.service.js";
import { asyncHandler } from "../utils/async-handler.js";
const settingsService = new UserSettingsService();
export const updateSettings = asyncHandler(async (request, response) => {
    const user = await settingsService.update(request.user.sub, request.body);
    response.json({ user });
});
//# sourceMappingURL=settings.controller.js.map