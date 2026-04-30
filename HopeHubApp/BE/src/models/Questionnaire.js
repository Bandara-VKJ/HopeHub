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
  completedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Questionnaire", questionnaireSchema);