import { verifyCallConnected, endVerifiedCall, getCallStatus } from "../controllers/callLifecycleController.js";
import express from "express";

import {
  createVoiceToken,
} from "../controllers/callController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:bookingId/connected", protect, verifyCallConnected);
router.post("/:bookingId/end", protect, endVerifiedCall);
router.get("/:bookingId/status", protect, getCallStatus);

router.post(
  "/voice/token",
  protect,
  createVoiceToken
);

export default router;