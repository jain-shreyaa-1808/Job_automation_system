import { Schema, Types, model } from "mongoose";
const actionSchema = new Schema({
    action: { type: String, required: true },
    details: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });
const jobApplicationSchema = new Schema({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    jobId: { type: Types.ObjectId, ref: "Job", required: true },
    status: {
        type: String,
        enum: ["new", "applied", "in-progress", "finished"],
        default: "new",
    },
    appliedVia: { type: String, default: "manual" },
    tailoredResumePath: String,
    history: { type: [actionSchema], default: [] },
    lastAttemptedAt: Date,
}, {
    timestamps: true,
});
jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
export const JobApplicationModel = model("JobApplication", jobApplicationSchema);
//# sourceMappingURL=JobApplication.js.map