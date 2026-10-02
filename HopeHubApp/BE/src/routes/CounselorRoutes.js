import express from "express";

import {
  registerCounselor,
  loginCounselor,
  getCounselors,
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

import {
  protect,
} from "../middlewares/authMiddleware.js";


const router = express.Router();


// ============================================================
// REGISTRATION / LOGIN
// ============================================================

router.post(
  "/register",
  registerCounselor
);

router.post(
  "/login",
  loginCounselor
);


// ============================================================
// ADMIN COUNSELOR MANAGEMENT
//
// IMPORTANT:
// Keep these BEFORE "/:id"
// ============================================================

router.get(
  "/admin/all",
  getCounselorsForAdmin
);

router.patch(
  "/admin/:id/approve",
  approveCounselor
);

router.patch(
  "/admin/:id/reject",
  rejectCounselor
);

router.delete(
  "/admin/:id",
  deleteCounselor
);


// ============================================================
// COUNSELOR AVAILABILITY
// ============================================================

router.patch(
  "/:id/availability",
  protect,
  updateCounselorAvailability
);


// ============================================================
// PATIENT ROUTES
// ============================================================

router.get(
  "/all-patients",
  protect,
  getAllPatients
);

router.get(
  "/patient/:patientId",
  protect,
  getPatientById
);

router.delete(
  "/patient/:patientId",
  protect,
  deletePatient
);


// ============================================================
// COUNSELOR LIST
// ============================================================

router.get(
  "/",
  protect,
  getCounselors
);


// ============================================================
// COUNSELOR BY ID
//
// IMPORTANT:
// Keep this last.
// ============================================================

router.get(
  "/:id",
  protect,
  getCounselorById
);


export default router;