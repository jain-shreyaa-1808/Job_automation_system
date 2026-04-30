import { Schema, Types, model, type InferSchemaType } from "mongoose";

const experienceSchema = new Schema(
  {
    company: String,
    title: String,
    startDate: String,
    endDate: String,
    summary: String,
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    name: String,
    summary: String,
    technologies: { type: [String], default: [] },
  },
  { _id: false },
);

const educationSchema = new Schema(
  {
    institution: String,
    degree: String,
    startDate: String,
    endDate: String,
  },
  { _id: false },
);

const userProfileSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [String], default: [] },
    parsedText: { type: String, default: "" },
    resumeFileName: String,
    resumeStoragePath: String,
    resumeScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export type UserProfileDocument = InferSchemaType<typeof userProfileSchema> & {
  _id: string;
};
export const UserProfileModel = model("UserProfile", userProfileSchema);
