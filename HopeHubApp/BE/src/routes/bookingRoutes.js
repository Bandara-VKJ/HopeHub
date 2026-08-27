import express from "express";

import {
  createBooking,
  getPatientBookings,
  getCounselorBookings,
  getBookedSlots,
  confirmBooking,
  cancelBooking,
} from "../controllers/bookingController.js";

const router =
  express.Router();

// ============================================================
// USER
// ============================================================

// Create booking
router.post(
  "/",
  createBooking
);

// Get user's bookings
router.get(
  "/patient/:patientId",
  getPatientBookings
);

// ============================================================
// COUNSELOR
// ============================================================

// Get counselor bookings
router.get(
  "/counselor/:counselorId",
  getCounselorBookings
);

// Get unavailable slots
router.get(
  "/counselor/:counselorId/slots",
  getBookedSlots
);

// Confirm booking
router.patch(
  "/:bookingId/confirm",
  confirmBooking
);

// Cancel booking
router.patch(
  "/:bookingId/cancel",
  cancelBooking
);

export default router;