import Questionnaire from "../models/Questionnaire.js";
import User from "../models/User.js";
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export const submitQuestionnaire = async (req, res) => {
  try {
    const { userId, answers, otherDrugName } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID was not identified",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        message: "Answers are required",
      });
    }

    const cleanDrugName =
      typeof otherDrugName === "string" ? otherDrugName.trim().slice(0, 100) : "";

    const levelResponse = await axios.post(
      `${ML_SERVICE_URL}/api/questionnaire/submit`,
      { userId, answers, otherDrugName: cleanDrugName }
    );

    const prediction = levelResponse.data;
    console.log("ML Result:", prediction);

    const newEntry = new Questionnaire({
      userId,
      answers,
      otherDrugName: cleanDrugName,
      version: 2,
      addictionLevel: prediction.addiction_level,
      confidence: prediction.confidence,
      personalityScores: prediction.personality_scores,
      drugScores: prediction.drug_scores,
      allProbabilities: prediction.all_probabilities,
      completedAt: new Date(),
    });

    await newEntry.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { predictedLevel: prediction.addiction_level },
      { new: true }
    );

    console.log("Updated user predictedLevel:", updatedUser?.predictedLevel);

    res.status(200).json({
      message: "Saved successfully",
      prediction: {
        addictionLevel: prediction.addiction_level,
        confidence: prediction.confidence,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving data" });
  }
};

export const checkQuestionnaireStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const existing = await Questionnaire.findOne({ userId });

    res.status(200).json({
      completed: !!existing,
      completedAt: existing ? existing.completedAt : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking status" });
  }
};