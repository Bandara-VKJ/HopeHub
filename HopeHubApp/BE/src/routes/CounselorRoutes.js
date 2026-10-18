
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

import uploadCounselorImage from
  "../middlewares/counselorImageUpload.js";

const router = express.Router();

// REGISTRATION
router.post(
  "/register",
  (req, res, next) => {
    uploadCounselorImage.single("image")(
      req,
      res,
      (error) => {
        if (error) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }

        next();
      }
    );
  },
  registerCounselor
);

// LOGIN
router.post(
  "/login",
  loginCounselor
);

// ADMIN MANAGEMENT
// These endpoints must additionally use
// verified admin-role authorization.
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

// COUNSELOR AVAILABILITY
router.patch(
  "/:id/availability",
  protect,
  updateCounselorAvailability
);

// PATIENT ROUTES
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

// COUNSELOR LIST
router.get(
  "/",
  protect,
  getCounselors
);

// COUNSELOR DETAILS
router.get(
  "/:id",
  protect,
  getCounselorById
);

export default router;
