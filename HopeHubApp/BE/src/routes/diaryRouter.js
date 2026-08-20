import express from "express";
import { addDiary, getDiaries } from "../controllers/diaryController.js";

const router = express.Router();

router.post('/diary-add', addDiary);
router.get('/diaries/:userId', getDiaries);

export default router;