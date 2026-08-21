import express from "express";
import { updateRisk } from "../controllers/riskController.js";

const router = express.Router();

router.patch('/level/:userId/:counselorId', updateRisk);

export default router;