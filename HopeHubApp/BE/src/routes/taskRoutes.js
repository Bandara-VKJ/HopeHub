import express from "express";
import {createWeeklyTasks, getTasks} from "../controllers/taskController.js"

const router = express.Router();

router.post('/add-tasks', createWeeklyTasks);
router.get('/tasks', getTasks);

export default router;