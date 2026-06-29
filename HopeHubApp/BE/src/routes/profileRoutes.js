import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get("/:userId", getProfile);
router.post("/save", upload.single("profilePic"),updateProfile);

export default router;