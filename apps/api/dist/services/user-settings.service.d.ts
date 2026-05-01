type PortalCredentialInput = {
    platform: string;
    username: string;
    password: string;
};
type SettingsInput = {
    currentCtc?: number;
    expectedCtc?: number;
    preferredRoles?: string[];
    preferredLocations?: string[];
    autoApplyEnabled?: boolean;
    portalCredentials?: PortalCredentialInput[];
};
export declare class UserSettingsService {
    update(userId: string, input: SettingsInput): Promise<(import("mongoose").Document<unknown, {}, {
        location: string;
        fullName: string;
        email: string;
        passwordHash: string;
        phone: string;
        linkedinUrl: string;
        portfolioUrl: string;
        githubUrl: string;
        noticePeriod: string;
        currentCtc: number;
        expectedCtc: number;
        preferredRoles: string[];
        preferredLocations: string[];
        autoApplyEnabled: boolean;
        credentialVault: import("mongoose").Types.DocumentArray<{
            platform: string;
            username: string;
            encryptedPassword: string;
            iv: string;
            tag: string;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
            platform: string;
            username: string;
            encryptedPassword: string;
            iv: string;
            tag: string;
        }> & {
            platform: string;
            username: string;
            encryptedPassword: string;
            iv: string;
            tag: string;
        }>;
        lastLoginAt?: NativeDate | null | undefined;
    } & import("mongoose").DefaultTimestampProps, {}, {
        timestamps: true;
    }> & {
        location: string;
        fullName: string;
        email: string;
        passwordHash: string;
        phone: string;
        linkedinUrl: string;
        portfolioUrl: string;
        githubUrl: string;
        noticePeriod: string;
        currentCtc: number;
        expectedCtc: number;
        preferredRoles: string[];
        preferredLocations: string[];
        autoApplyEnabled: boolean;
        credentialVault: import("mongoose").Types.DocumentArray<{
            platform: string;
            username: string;
            encryptedPassword: string;
            iv: string;
            tag: string;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
            platform: string;
            username: string;
            encryptedPassword: string;
            iv: string;
            tag: string;
        }> & {
            platform: string;
            username: string;
            encryptedPassword: string;
            iv: string;
            tag: string;
        }>;
        lastLoginAt?: NativeDate | null | undefined;
    } & import("mongoose").DefaultTimestampProps & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
}
export {};
