import express from "express";
import {createWeeklyTasks} from "../controllers/taskController.js"

const router = express.Router();

router.post('/add-tasks', createWeeklyTasks)

export default router;