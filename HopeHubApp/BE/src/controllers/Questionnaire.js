import express from "express";
import Questionnaire from "../models/Questionnaire.js";
import axios from "axios";

const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export const submitQuestionnaire = async (req, res) => {
  try {
    const { userId, answers, gender } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID was not identified",
      });
    }

    const levelResponse = await axios.post(
      `${ML_SERVICE_URL}/api/questionnaire/submit`,
      { userId, gender: gender || "M", answers }
    );

    const prediction = levelResponse.data;
    console.log("ML Result:", prediction);

    const newEntry = new Questionnaire({
      userId,
      answers,
      addictionLevel: prediction.addiction_level,
      confidence: prediction.confidence,
      personalityScores: prediction.personality_scores,
      drugScores: prediction.drug_scores,
      allProbabilities: prediction.all_probabilities,
      completedAt: new Date(),
    });

    await newEntry.save();

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

export const checkQuestionnaireStatus = async (req,res) =>{
  try {
    const { userId } = req.params;

    const existing = await Questionnaire.findOne({userId});

    res.status(200).json({
      completed: !!existing
    });
  } catch (error) {
     res.status(500).json({ message: "Error checking status" });
  }
};
