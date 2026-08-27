import mongoose from "mongoose";

const bookingSchema =
  new mongoose.Schema(
    {
      counselor: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Counselor",
        required: true,
      },

      patient: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      sessionDate: {
        type: String,
        required: true,
        trim: true,
      },

      sessionTime: {
        type: String,
        required: true,
        trim: true,
      },

      sessionType: {
        type: String,
        enum: [
          "Chat",
          "Video",
          "Voice",
        ],
        default: "Chat",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "cancelled",
        ],
        default: "pending",
      },

      notes: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default
  mongoose.models.Booking ||
  mongoose.model(
    "Booking",
    bookingSchema
  );