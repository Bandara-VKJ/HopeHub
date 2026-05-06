import express from "express";
import {
  registerCounselor,
  loginCounselor,
  getCounselors,
  getCounselorById,
  updateCounselorAvailability,
} from "../controllers/CounselorController.js";

const router = express.Router();

router.post("/register", registerCounselor);
router.post("/login", loginCounselor);

router.patch("/:id/availability", updateCounselorAvailability);

router.get("/", getCounselors);
router.get("/:id", getCounselorById);

export default router;