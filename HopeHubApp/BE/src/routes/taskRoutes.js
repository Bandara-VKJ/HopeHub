import express from "express";
import {createWeeklyTasks, getTasks, getTasksById} from "../controllers/taskController.js"

const router = express.Router();

router.post('/add-tasks', createWeeklyTasks);
router.get('/tasks', getTasks);
router.get('/user-tasks', getTasksById);

export default router;