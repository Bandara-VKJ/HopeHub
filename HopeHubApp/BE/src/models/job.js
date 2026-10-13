import mongoose from "mongoose";

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];

const jobSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 150,
    },

    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: 150,
    },

    location: { type: String, trim: true, default: "" },

    type: {
      type: String,
      enum: {
        values: JOB_TYPES,
        message: "{VALUE} is not a valid job type",
      },
      default: "Full-time",
    },

    salary: { type: String, trim: true, default: "" },

    recommendedFor: { type: String, trim: true, default: "" },

    description: { type: String, trim: true, maxlength: 5000, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;