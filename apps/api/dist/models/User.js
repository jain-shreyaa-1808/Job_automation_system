import { Schema, model } from "mongoose";
const portalCredentialSchema = new Schema({
    platform: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    encryptedPassword: { type: String, required: true },
    iv: { type: String, required: true },
    tag: { type: String, required: true },
}, { _id: false });
const userSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: { type: String, required: true },
    currentCtc: { type: Number, default: 0 },
    expectedCtc: { type: Number, default: 0 },
    preferredRoles: { type: [String], default: [] },
    preferredLocations: { type: [String], default: [] },
    autoApplyEnabled: { type: Boolean, default: false },
    credentialVault: { type: [portalCredentialSchema], default: [] },
    lastLoginAt: { type: Date },
}, {
    timestamps: true,
});
export const UserModel = model("User", userSchema);
//# sourceMappingURL=User.js.map