import express from "express";

import {
  saveLifeBuildAssessment,
  getLifeBuildScore,
} from "../controllers/lifeBuildingScoreQuestionsController.js";

const router = express.Router();

router.post("/assessment", saveLifeBuildAssessment );
router.get("/score/:userId", getLifeBuildScore );

export default router;
