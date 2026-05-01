type SignupInput = {
    fullName: string;
    email: string;
    password: string;
    currentCtc?: number;
    expectedCtc?: number;
    preferredRoles?: string[];
    preferredLocations?: string[];
};
export declare class AuthService {
    signup(input: SignupInput): Promise<{
        accessToken: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            currentCtc: number;
            expectedCtc: number;
            preferredRoles: string[];
            preferredLocations: string[];
            autoApplyEnabled: boolean;
        };
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            currentCtc: number;
            expectedCtc: number;
            preferredRoles: string[];
            preferredLocations: string[];
            autoApplyEnabled: boolean;
        };
    }>;
    getUserById(userId: string): Promise<(import("mongoose").Document<unknown, {}, {
        fullName: string;
        email: string;
        passwordHash: string;
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
        fullName: string;
        email: string;
        passwordHash: string;
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
    private buildAuthResponse;
}
export {};
