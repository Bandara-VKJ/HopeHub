import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/:userId", getProfile);
router.post("/save", updateProfile);

export default router;