import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  roomSid: { type: String, required: true },
  connectedAt: { type: Date },
  endedAt: { type: Date },
}, { timestamps: true });

callSessionSchema.index({ booking: 1, roomSid: 1 }, { unique: true });
export default mongoose.models.CallSession || mongoose.model("CallSession", callSessionSchema);
