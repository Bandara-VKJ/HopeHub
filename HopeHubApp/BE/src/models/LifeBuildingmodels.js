import mongoose from "mongoose";

const lifeBuildSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: {
      type: Object,
      required: true,
    },

    interests: {
      type: [String],
      default: [],
    },

    recoverySafetyScore: {
      type: Number,
      default: 0,
    },

    riskLevel: {
      type: String,
    },

    recommendedJobs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const LifeBuildAssessment = mongoose.model(
  "LifeBuildAssessment",
  lifeBuildSchema
);

export default LifeBuildAssessment;