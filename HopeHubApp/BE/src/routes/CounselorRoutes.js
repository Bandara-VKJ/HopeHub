import express from "express";
import {
  registerCounselor,
  loginCounselor,
  getCounselors,
  getCounselorById,
  updateCounselorAvailability,
  getAllPatients,
  getPatientById,
  deletePatient
} from "../controllers/CounselorController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerCounselor);
router.post("/login", loginCounselor);

router.patch("/:id/availability", protect, updateCounselorAvailability);

router.get("/all-patients", protect, getAllPatients);
router.get("/patient/:patientId", protect, getPatientById);
router.delete("/patient/:patientId", protect, deletePatient);

router.get("/", protect, getCounselors);
router.get("/:id", protect, getCounselorById);

export default router;