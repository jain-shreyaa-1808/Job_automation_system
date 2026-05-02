import { Schema, Types, model, type InferSchemaType } from "mongoose";

const jobSchema = new Schema(
  {
    sourceUserId: { type: Types.ObjectId, ref: "User", required: true },
    externalId: { type: String, index: true, sparse: true },
    title: { type: String, required: true, trim: true },
    normalizedTitle: { type: String, default: "", index: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
    platform: { type: String, required: true },
    location: { type: String, default: "Remote" },
    extractedSkills: { type: [String], default: [] },
    categoryTags: { type: [String], default: [] },
    relevanceScore: { type: Number, default: 0 },
    isProfileFit: { type: Boolean, default: true },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 2 },
    employmentType: { type: String, default: "Full-time" },
    postedDate: { type: Date },
    applicantCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["new", "applied", "in-progress", "finished", "bookmarked"],
      default: "new",
    },
    jobSource: {
      type: String,
      enum: ["mock", "remote"],
      default: "mock",
    },
    linkStatus: {
      type: String,
      enum: ["valid", "invalid", "unchecked"],
      default: "unchecked",
    },
    linkCheckedAt: { type: Date },
    discoveredAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

jobSchema.index(
  { sourceUserId: 1, title: 1, company: 1, link: 1 },
  { unique: true },
);

export type JobDocument = InferSchemaType<typeof jobSchema> & { _id: string };
export const JobModel = model("Job", jobSchema);
