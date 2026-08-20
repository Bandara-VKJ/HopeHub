import express from "express";
import { addDiary, getDiaries, editDiary, deleteDiary } from "../controllers/diaryController.js";

const router = express.Router();

router.post('/diary-add', addDiary);
router.get('/diaries/:userId', getDiaries);
router.put("/diaries/:userId/:diaryId", editDiary);
router.delete("/diaries/:userId/:diaryId", deleteDiary);

export default router;
