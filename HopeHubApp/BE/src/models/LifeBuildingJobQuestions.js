import mongoose from "mongoose";

const lifeBuildJobSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    age: { type: Number, required: true, min: 10, max: 100 },

    gender: {
      type: String,
      enum: ["Male", "Female", "Prefer not to say"],
      required: true,
    },

    education: {
      type: String,
      enum: ["No formal education", "Primary", "Secondary", "Diploma", "Degree or higher"],
      required: true,
    },

    jobInterest: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 3,
        message: "Select between 1 and 3 interests",
      },
    },

    skills: {
      type: Map,
      of: Number,
      default: {},
    },

    jobCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LifeBuildJob = mongoose.model("LifeBuildJob", lifeBuildJobSchema);
export default LifeBuildJob;