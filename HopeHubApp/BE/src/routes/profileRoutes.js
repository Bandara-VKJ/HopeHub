import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import upload from '../middlewares/upload.js';
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:userId", protect, getProfile);
router.post("/save", protect, upload.single("profilePic"),updateProfile);

export default router;