import mongoose from "mongoose";

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];

export const INTEREST_OPTIONS = [
  "Fixing machines or tools",
  "Working with computers",
  "Drawing or designing",
  "Helping people",
  "Teaching or mentoring",
  "Managing projects",
  "Farming or gardening",
  "Cooking",
  "Selling products",
  "Organizing events",
  "Driving",
  "Working outdoors",
];

export const SKILL_OPTIONS = [
  "Communication",
  "Teamwork",
  "Problem Solving",
  "Time Management",
  "Computer Skills",
  "Leadership",
  "Creativity",
  "Decision Making",
];

export const EDUCATION_LEVELS = [
  "No formal education",
  "Primary",
  "Secondary",
  "Diploma",
  "Degree or higher",
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

    contactNumber: {
      type: String,
      trim: true,
      default: "",
      match: [
        /^$|^[0-9+\s\-]{9,15}$/,
        "Contact number must be 9-15 digits (may include +, spaces or -)",
      ],
    },

    recommendedFor: { type: String, trim: true, default: "" },

    description: { type: String, trim: true, maxlength: 5000, default: "" },

    // ---------- Recommendation fields ----------

    // Which of the app's interest options this job suits
    interestTags: {
      type: [{ type: String, enum: INTEREST_OPTIONS }],
      default: [],
    },

    // { "Communication": 3, "Computer Skills": 4 }  (levels 1-5, validated in the controller)
    requiredSkills: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // One of EDUCATION_LEVELS, or "" for no requirement
    minEducation: {
      type: String,
      enum: { values: [...EDUCATION_LEVELS, ""], message: "{VALUE} is not a valid education level" },
      default: "",
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, minimize: false }
);

jobSchema.index({ createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;