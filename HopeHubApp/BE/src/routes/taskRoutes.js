import express from "express";
import {createWeeklyTasks, getTasks, getTasksById, updateFamilyStatus, updatePatientStatus, getTaskStatusStats } from "../controllers/taskController.js"
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/add-tasks', protect, createWeeklyTasks);
router.get('/tasks', protect, getTasks);
router.get('/user-tasks', protect, getTasksById);
router.patch('/:taskId/family-status', protect, updateFamilyStatus);
router.patch('/:taskId/status', protect, updatePatientStatus);
router.get('/taks/stats', protect, getTaskStatusStats);

export default router;