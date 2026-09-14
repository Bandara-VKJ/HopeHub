import express from "express";
import { getAIConversation, sendAIMessage, clearAIConversation } from "../controllers/aiCounselingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/conversation/:userId", protect, getAIConversation );

router.post("/message", protect, sendAIMessage );

router.delete("/conversation/:userId", protect, clearAIConversation );

export default router;