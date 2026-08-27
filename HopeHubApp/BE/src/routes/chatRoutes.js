import express from "express";

import {
  getChatMessages,
} from "../controllers/chatController.js";

const router =
  express.Router();


// ============================================================
// GET CHAT HISTORY
// ============================================================

router.get(
  "/:bookingId/messages",
  getChatMessages
);


export default router;