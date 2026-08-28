import express from "express";

import {
  getAIConversation,
  sendAIMessage,
  clearAIConversation,
} from "../controllers/aiCounselingController.js";

const router = express.Router();

/*
============================================================
GET CONVERSATION
============================================================
*/
router.get(
  "/conversation/:userId",
  getAIConversation
);

/*
============================================================
SEND MESSAGE
============================================================
*/
router.post(
  "/message",
  sendAIMessage
);

/*
============================================================
CLEAR CONVERSATION
============================================================
*/
router.delete(
  "/conversation/:userId",
  clearAIConversation
);

export default router;