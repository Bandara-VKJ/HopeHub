import express from "express";
import { createBooking, getPatientBookings, getCounselorBookings, getBookedSlots, confirmBooking, cancelBooking } from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post( "/", protect, createBooking );

router.get( "/patient/:patientId", protect, getPatientBookings );

router.get( "/counselor/:counselorId", protect, getCounselorBookings );

router.get( "/counselor/:counselorId/slots", protect, getBookedSlots );

router.patch("/:bookingId/confirm", protect, confirmBooking );

router.patch("/:bookingId/cancel", protect, cancelBooking );

export default router;