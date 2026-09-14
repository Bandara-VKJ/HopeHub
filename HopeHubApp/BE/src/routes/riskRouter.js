import express from "express";
import { updateRisk } from "../controllers/riskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.patch('/level/:userId/:counselorId', protect, updateRisk);

export default router;