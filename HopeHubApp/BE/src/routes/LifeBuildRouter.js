import express from "express";

import {
  createAssessment,
  getLatestAssessment,
} from "../controllers/LifeBuildController.js";

const router = express.Router();

// Submit all 25 questions
router.post("/assessment", createAssessment);

// Get latest result for a user
router.get("/assessment/:userId", getLatestAssessment);

export default router;