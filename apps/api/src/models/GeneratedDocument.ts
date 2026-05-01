import { Schema, Types, model, type InferSchemaType } from "mongoose";

const generatedDocumentSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    jobId: { type: Types.ObjectId, ref: "Job" },
    type: {
      type: String,
      enum: ["resume", "cover-letter", "outreach-email", "linkedin-message", "referral-request"],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

export type GeneratedDocumentRecord = InferSchemaType<
  typeof generatedDocumentSchema
> & { _id: string };
export const GeneratedDocumentModel = model(
  "GeneratedDocument",
  generatedDocumentSchema,
);
