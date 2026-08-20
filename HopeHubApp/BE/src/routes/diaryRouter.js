import express from "express";
import { addDiary } from "../controllers/diaryController.js";

const router = express.Router();

router.post('/diary-add', addDiary);

export default router;