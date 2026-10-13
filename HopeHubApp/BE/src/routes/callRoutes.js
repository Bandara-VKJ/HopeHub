import express from "express";

import {
  createVoiceToken,
} from "../controllers/callController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/voice/token",
  protect,
  createVoiceToken
);

export default router;