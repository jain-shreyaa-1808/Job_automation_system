import { Schema, Types, model, type InferSchemaType } from "mongoose";

const actionSchema = new Schema(
  {
    action: { type: String, required: true },
    details: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const jobApplicationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    jobId: { type: Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: [
        "new",
        "pending-verification",
        "applied",
        "in-progress",
        "finished",
      ],
      default: "new",
    },
    appliedVia: { type: String, default: "manual" },
    tailoredResumePath: String,
    preFilledData: { type: Schema.Types.Mixed, default: {} },
    history: { type: [actionSchema], default: [] },
    lastAttemptedAt: Date,
  },
  {
    timestamps: true,
  },
);

jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export type JobApplicationDocument = InferSchemaType<
  typeof jobApplicationSchema
> & { _id: string };
export const JobApplicationModel = model(
  "JobApplication",
  jobApplicationSchema,
);
