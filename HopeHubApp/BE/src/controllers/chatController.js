import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import ChatMessage from "../models/ChatMessage.js";


// ============================================================
// CHECK BOOKING ACCESS
// ============================================================

const checkBookingAccess = async (
  bookingId,
  userId
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        bookingId
      )
    ) {
      return null;
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return null;
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return null;
    }

    // Chat only after counselor confirms
    if (
      booking.status !==
      "confirmed"
    ) {
      return null;
    }

    const isPatient =
      String(booking.patient) ===
      String(userId);

    const isCounselor =
      String(booking.counselor) ===
      String(userId);

    if (
      !isPatient &&
      !isCounselor
    ) {
      return null;
    }

    return booking;
  } catch (error) {
    console.error(
      "CHECK BOOKING ACCESS ERROR:",
      error
    );

    return null;
  }
};


// ============================================================
// GET CHAT MESSAGES
// ============================================================

export const getChatMessages =
  async (req, res) => {
    try {
      const {
        bookingId,
      } = req.params;

      const {
        userId,
      } = req.query;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message:
            "Booking ID is required.",
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "User ID is required.",
        });
      }

      const booking =
        await checkBookingAccess(
          bookingId,
          userId
        );

      if (!booking) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this chat. The booking must be confirmed and you must be part of the booking.",
        });
      }

      const messages =
        await ChatMessage.find({
          booking: bookingId,
        })
          .sort({
            createdAt: 1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error(
        "GET CHAT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load chat messages.",
      });
    }
  };