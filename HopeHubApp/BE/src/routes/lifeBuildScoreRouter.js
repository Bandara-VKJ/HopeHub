import express from "express";
import { saveLifeBuildAssessment, getLifeBuildScore } from "../controllers/lifeBuildingScoreQuestionsController.js";
import { saveJobProfile, getJobProfile } from "../controllers/lifeBuildJobController.js";

const router = express.Router();

router.post("/assessment", saveLifeBuildAssessment );
router.get("/score/:userId", getLifeBuildScore );

router.post("/profile", saveJobProfile);
router.get("/profile/:userId", getJobProfile);

export default router;