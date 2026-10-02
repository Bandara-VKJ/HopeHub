import mongoose from "mongoose";

const lifeBuildScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    answers: {
      type: Map,
      of: Number,
      required: true,
    },

    obtainedScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const LifeBuildingSelfQuestions = mongoose.model(
  "LifeBuildAssessment",
  lifeBuildScoreSchema
);

export default LifeBuildingSelfQuestions;
