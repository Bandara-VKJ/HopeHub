import express from "express";
import { createJob, getJobs, getJobById } from "../controllers/jobController.js"

import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/add-job", upload.single("image"), createJob);
router.get("/all-jobs", getJobs);
router.get("/get-job/:jobId", getJobById);

export default router;