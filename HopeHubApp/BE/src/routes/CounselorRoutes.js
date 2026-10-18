import express from "express";
import {
  registerCounselor,
  loginCounselor,
  getCounselors,
  getCounselorRecommendations,
  getCounselorsForAdmin,
  getCounselorById,
  approveCounselor,
  rejectCounselor,
  deleteCounselor,
  updateCounselorAvailability,
  getAllPatients,
  getPatientById,
  deletePatient,
} from "../controllers/CounselorController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { protectAdmin } from "../middlewares/adminAuth.js";
import uploadCounselorImage from "../middlewares/counselorImageUpload.js";

const router = express.Router();

router.post("/register", (req, res, next) => {
  uploadCounselorImage.single("image")(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, message: error.message });
    next();
  });
}, registerCounselor);

router.post("/login", loginCounselor);

router.get("/admin/all", protectAdmin, getCounselorsForAdmin);
router.patch("/admin/:id/approve", protectAdmin, approveCounselor);
router.patch("/admin/:id/reject", protectAdmin, rejectCounselor);
router.delete("/admin/:id", protectAdmin, deleteCounselor);

router.patch("/:id/availability", protect, updateCounselorAvailability);
router.get("/all-patients", protect, getAllPatients);
router.get("/patient/:patientId", protect, getPatientById);
router.delete("/patient/:patientId", protect, deletePatient);

// Keep this literal path BEFORE /:id.
router.get("/recommendations", protect, getCounselorRecommendations);
router.get("/", protect, getCounselors);
router.get("/:id", protect, getCounselorById);

export default router;
