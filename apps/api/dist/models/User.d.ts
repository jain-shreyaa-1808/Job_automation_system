import { Schema, type InferSchemaType } from "mongoose";
declare const userSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
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
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
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
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
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
} & import("mongoose").DefaultTimestampProps> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export type UserDocument = InferSchemaType<typeof userSchema> & {
    _id: string;
};
export declare const UserModel: import("mongoose").Model<{
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
} & import("mongoose").DefaultTimestampProps, {}, {}, {}, import("mongoose").Document<unknown, {}, {
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
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
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
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
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
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
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
} & import("mongoose").DefaultTimestampProps> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>>;
export {};
