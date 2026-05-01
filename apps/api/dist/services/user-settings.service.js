import { UserModel } from "../models/User.js";
import { encryptSecret } from "../utils/crypto.js";
export class UserSettingsService {
    async update(userId, input) {
        const credentialVault = input.portalCredentials?.map((credential) => {
            const encrypted = encryptSecret(credential.password);
            return {
                platform: credential.platform,
                username: credential.username,
                encryptedPassword: encrypted.encryptedValue,
                iv: encrypted.iv,
                tag: encrypted.tag,
            };
        });
        const user = await UserModel.findByIdAndUpdate(userId, {
            ...(input.currentCtc !== undefined
                ? { currentCtc: input.currentCtc }
                : {}),
            ...(input.expectedCtc !== undefined
                ? { expectedCtc: input.expectedCtc }
                : {}),
            ...(input.preferredRoles
                ? { preferredRoles: input.preferredRoles }
                : {}),
            ...(input.preferredLocations
                ? { preferredLocations: input.preferredLocations }
                : {}),
            ...(input.autoApplyEnabled !== undefined
                ? { autoApplyEnabled: input.autoApplyEnabled }
                : {}),
            ...(credentialVault ? { credentialVault } : {}),
        }, { new: true }).select("-passwordHash");
        return user;
    }
}
//# sourceMappingURL=user-settings.service.js.map