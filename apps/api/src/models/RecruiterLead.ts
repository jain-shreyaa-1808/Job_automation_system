import { Schema, Types, model, type InferSchemaType } from "mongoose";

const recruiterLeadSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    jobId: { type: Types.ObjectId, ref: "Job", required: true },
    name: { type: String, required: true },
    title: { type: String, default: "Recruiter" },
    company: { type: String, required: true },
    profileUrl: String,
    recentPosts: { type: [String], default: [] },
    state: {
      type: String,
      enum: ["pending", "action-taken", "finished"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

recruiterLeadSchema.index({ userId: 1, jobId: 1, name: 1 }, { unique: true });

export type RecruiterLeadDocument = InferSchemaType<
  typeof recruiterLeadSchema
> & { _id: string };
export const RecruiterLeadModel = model("RecruiterLead", recruiterLeadSchema);
