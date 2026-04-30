import express from "express";
import Questionnaire from "../models/Questionnaire.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { userId, answers } = req.body;

    const newEntry = new Questionnaire({
      userId,
      answers,
      completedAt: new Date()
    });

    await newEntry.save();

    res.status(200).json({ message: "Saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving data" });
  }
});

export default router;