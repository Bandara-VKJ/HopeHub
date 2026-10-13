import mongoose from "mongoose";

const questionnaireSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  answers: {
    type: Object,
    required: true
  },
  otherDrugName: {
    type: String,
    default: "",
    trim: true,
    maxlength: 100
  },
  version: {
    type: Number,
    default: 2
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Questionnaire", questionnaireSchema);