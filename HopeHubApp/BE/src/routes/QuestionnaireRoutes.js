import express from "express";
import { submitQuestionnaire, checkQuestionnaireStatus } from "../controllers/Questionnaire.js";

const router = express.Router();

router.post("/submit", submitQuestionnaire);

router.get("/status/:userId", checkQuestionnaireStatus);

export default router;