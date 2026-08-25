import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "counselor"], default: "user" },
    mobile: { type: String, default: "" },
    profilePic: { type: String, default: null },

    // Raw output from the ML model — stores whatever label_encoder.classes_ produces
    predictedLevel: { type: String, default: null },

    // Counselor override, using your existing app-facing categories
    counselorLevel: {
      type: String,
      enum: ["Low", "Mid", "High", "Contact with counselor"],
      default: null,
    },
    counselorLevelBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    counselorLevelAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Effective level shown to the app: counselor override wins, else the mapped prediction
userSchema.virtual("level").get(function () {
  if (this.counselorLevel) return this.counselorLevel;
  return mapPredictedToAppLevel(this.predictedLevel);
});

function mapPredictedToAppLevel(predicted) {
  if (!predicted) return "Contact with counselor";
  // TODO: replace with your model's actual label_encoder.classes_ values
  const mapping = {
    "Level 1 No Risk": "Low",
    "Level 2": "Low",
    "Level 3": "Mid",
    "Level 4": "Mid",
    "Level 5": "High",
    "Level 6": "High",
    "Level 7 Severe": "High",
  };
  return mapping[predicted] || "Contact with counselor";
}

const User = mongoose.model("User", userSchema);

export default User;