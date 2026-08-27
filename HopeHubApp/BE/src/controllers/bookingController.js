import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Counselor from "../models/Counselor.js";

const isValidId = (id) => {
  return (
    typeof id === "string" &&
    mongoose.Types.ObjectId.isValid(id)
  );
};

// ============================================================
// CREATE BOOKING
// POST /api/bookings
// ============================================================

export const createBooking = async (req, res) => {
  try {
    console.log("\n====================================");
    console.log("CREATE BOOKING REQUEST");
    console.log("BODY:", req.body);
    console.log("====================================");

    const {
      counselor,
      patient,
      sessionDate,
      sessionTime,
      sessionType,
      notes,
    } = req.body;

    // --------------------------------------------------------
    // Validate required fields
    // --------------------------------------------------------

    if (!counselor) {
      return res.status(400).json({
        success: false,
        message: "Counselor ID is required.",
      });
    }

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required.",
      });
    }

    if (!sessionDate) {
      return res.status(400).json({
        success: false,
        message: "Session date is required.",
      });
    }

    if (!sessionTime) {
      return res.status(400).json({
        success: false,
        message: "Session time is required.",
      });
    }

    // --------------------------------------------------------
    // Validate MongoDB IDs
    // --------------------------------------------------------

    if (!isValidId(counselor)) {
      return res.status(400).json({
        success: false,
        message: `Invalid counselor ID: ${counselor}`,
      });
    }

    if (!isValidId(patient)) {
      return res.status(400).json({
        success: false,
        message: `Invalid patient ID: ${patient}`,
      });
    }

    // --------------------------------------------------------
    // Check counselor exists
    // --------------------------------------------------------

    const counselorExists =
      await Counselor.findById(counselor);

    if (!counselorExists) {
      return res.status(404).json({
        success: false,
        message: "Counselor was not found.",
      });
    }

    // --------------------------------------------------------
    // Check patient exists
    // --------------------------------------------------------

    const patientExists =
      await User.findById(patient);

    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: "Patient/user was not found.",
      });
    }

    // --------------------------------------------------------
    // Check selected slot
    // --------------------------------------------------------

    const existingBooking =
      await Booking.findOne({
        counselor: counselor,
        sessionDate: sessionDate,
        sessionTime: sessionTime,
        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },
      });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot has already been booked. Please select another time.",
      });
    }

    // --------------------------------------------------------
    // Create booking
    // --------------------------------------------------------

    const booking =
      new Booking({
        counselor: counselor,
        patient: patient,
        sessionDate: String(sessionDate).trim(),
        sessionTime: String(sessionTime).trim(),
        sessionType:
          sessionType === "Video" ||
          sessionType === "Voice"
            ? sessionType
            : "Chat",
        notes: notes
          ? String(notes).trim()
          : "",
        status: "pending",
      });

    const savedBooking =
      await booking.save();

    console.log(
      "BOOKING SAVED:",
      savedBooking._id
    );

    // --------------------------------------------------------
    // Return populated booking
    // --------------------------------------------------------

    const populatedBooking =
      await Booking.findById(
        savedBooking._id
      )
        .populate(
          "counselor",
          "firstName lastName name email mobile title specialty experience availability rating reviews available topRated avatar avatarColor image"
        )
        .populate(
          "patient",
          "firstName lastName name email mobile"
        );

    console.log(
      "POPULATED BOOKING:",
      populatedBooking
    );

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error(
      "===================================="
    );
    console.error(
      "CREATE BOOKING ERROR:",
      error
    );
    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating booking.",
      error: error.message,
    });
  }
};

// ============================================================
// GET PATIENT BOOKINGS
// GET /api/bookings/patient/:patientId
// ============================================================

export const getPatientBookings = async (
  req,
  res
) => {
  try {
    const { patientId } =
      req.params;

    if (!isValidId(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID.",
      });
    }

    const bookings =
      await Booking.find({
        patient: patientId,
      })
        .populate(
          "counselor",
          "firstName lastName name email mobile title specialty experience availability rating reviews available topRated avatar avatarColor image"
        )
        .populate(
          "patient",
          "firstName lastName name email mobile"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "GET PATIENT BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load patient bookings.",
      error: error.message,
    });
  }
};

// ============================================================
// GET COUNSELOR BOOKINGS
// GET /api/bookings/counselor/:counselorId
// ============================================================

export const getCounselorBookings =
  async (req, res) => {
    try {
      const { counselorId } =
        req.params;

      if (!isValidId(counselorId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid counselor ID.",
        });
      }

      const bookings =
        await Booking.find({
          counselor: counselorId,
        })
          .populate(
            "patient",
            "firstName lastName name email mobile"
          )
          .populate(
            "counselor",
            "firstName lastName name email mobile title specialty experience availability rating reviews available topRated avatar avatarColor image"
          )
          .sort({
            sessionDate: 1,
            sessionTime: 1,
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error(
        "GET COUNSELOR BOOKINGS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load counselor bookings.",
        error: error.message,
      });
    }
  };

// ============================================================
// GET BOOKED SLOTS
// GET /api/bookings/counselor/:counselorId/slots
// ============================================================

export const getBookedSlots = async (
  req,
  res
) => {
  try {
    const { counselorId } =
      req.params;

    const { date } = req.query;

    if (!isValidId(counselorId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid counselor ID.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required.",
      });
    }

    const bookings =
      await Booking.find({
        counselor: counselorId,
        sessionDate: String(date),
        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },
      }).select(
        "sessionTime status"
      );

    return res.status(200).json({
      success: true,
      bookedSlots: bookings,
    });
  } catch (error) {
    console.error(
      "GET BOOKED SLOTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load booked slots.",
      error: error.message,
    });
  }
};

// ============================================================
// CONFIRM BOOKING
// PATCH /api/bookings/:bookingId/confirm
// ============================================================

export const confirmBooking = async (
  req,
  res
) => {
  try {
    const { bookingId } =
      req.params;

    if (!isValidId(bookingId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking ID.",
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }

    if (
      booking.status ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A cancelled booking cannot be confirmed.",
      });
    }

    booking.status =
      "confirmed";

    await booking.save();

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "counselor",
          "firstName lastName name email mobile title specialty experience availability rating reviews available topRated avatar avatarColor image"
        )
        .populate(
          "patient",
          "firstName lastName name email mobile"
        );

    return res.status(200).json({
      success: true,
      message:
        "Booking confirmed successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "CONFIRM BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to confirm booking.",
      error: error.message,
    });
  }
};

// ============================================================
// CANCEL BOOKING
// PATCH /api/bookings/:bookingId/cancel
// ============================================================

export const cancelBooking = async (
  req,
  res
) => {
  try {
    const { bookingId } =
      req.params;

    if (!isValidId(bookingId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking ID.",
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }

    booking.status =
      "cancelled";

    await booking.save();

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "counselor",
          "firstName lastName name email mobile title specialty experience availability rating reviews available topRated avatar avatarColor image"
        )
        .populate(
          "patient",
          "firstName lastName name email mobile"
        );

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "CANCEL BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel booking.",
      error: error.message,
    });
  }
};