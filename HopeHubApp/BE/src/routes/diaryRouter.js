import express from "express";
import { addDiary, getDiaries, editDiary, deleteDiary, weekDiary } from "../controllers/diaryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/diary-add', protect, addDiary);
router.get('/diaries/:userId', protect, getDiaries);
router.put("/diaries/:userId/:diaryId", protect, editDiary);
router.delete("/diaries/:userId/:diaryId", protect, deleteDiary);
router.get("/diaries/counselor/:userId/:counselorId", protect, weekDiary);

export default router;
