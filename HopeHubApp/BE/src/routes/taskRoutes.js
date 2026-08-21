import express from "express";
import {createWeeklyTasks, getTasks, getTasksById, updateFamilyStatus, updatePatientStatus } from "../controllers/taskController.js"

const router = express.Router();

router.post('/add-tasks', createWeeklyTasks);
router.get('/tasks', getTasks);
router.get('/user-tasks', getTasksById);
router.patch('/:taskId/family-status', updateFamilyStatus);
router.patch('/:taskId/status', updatePatientStatus);

export default router;