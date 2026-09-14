import express from "express";
import { submitQuestionnaire, checkQuestionnaireStatus } from "../controllers/Questionnaire.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/submit", protect, submitQuestionnaire);

router.get("/status/:userId", protect, checkQuestionnaireStatus);

export default router;