import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import CallSession from "../models/CallSession.js";

const validScore = (score) => typeof score === "number" && Number.isInteger(score) && score >= 1 && score <= 5;
const finishedCall = (bookingId) => CallSession.exists({ booking: bookingId,
  connectedAt: { $type: "date" }, endedAt: { $type: "date" } });

function patientAccess(req, res) {
  if (req.user?.role !== "user" || !mongoose.isValidObjectId(req.user?.id)) {
    res.status(403).json({ message: "Patient access required." }); return false;
  }
  return true;
}

export async function getRatingSummaries(req, res) {
  try {
    const summaries = await Booking.aggregate([
      { $match: { status: "confirmed", "patientRating.score": { $gte: 1, $lte: 5 } } },
      { $group: { _id: "$counselor", average: { $avg: "$patientRating.score" }, count: { $sum: 1 } } },
      { $project: { _id: 0, counselorId: { $toString: "$_id" }, average: 1, count: 1 } },
    ]);
    return res.json({ success: true, summaries });
  } catch (error) {
    console.error("Rating summaries failed:", error);
    return res.status(500).json({ message: "Could not load ratings." });
  }
}

export async function getMyRatingSessions(req, res) {
  if (!patientAccess(req, res)) return;
  try {
    // Restrict the call lookup to the authenticated patient's bookings.
    const bookings = await Booking.find({ patient: req.user.id, status: "confirmed" })
      .select("counselor sessionDate sessionTime patientRating")
      .populate("counselor", "name").sort({ sessionDate: -1, createdAt: -1 }).lean();
    const ids = await CallSession.distinct("booking", {
      booking: { $in: bookings.map(item => item._id) },
      connectedAt: { $type: "date" }, endedAt: { $type: "date" },
    });
    const eligible = new Set(ids.map(String));
    const sessions = bookings.filter(booking => booking.counselor && eligible.has(String(booking._id)))
      .map(booking => ({ _id: booking._id, counselorName: booking.counselor.name,
        sessionDate: booking.sessionDate, sessionTime: booking.sessionTime, score: booking.patientRating?.score }));
    return res.json({ success: true, sessions });
  } catch (error) {
    console.error("Rating sessions failed:", error);
    return res.status(500).json({ message: "Could not load rating sessions." });
  }
}

export async function getRatingEligibility(req, res) {
  if (!patientAccess(req, res)) return;
  if (!mongoose.isValidObjectId(req.params.bookingId)) return res.status(400).json({ message: "Invalid booking." });
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, patient: req.user.id }).populate("counselor", "name");
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    return res.json({ eligible: booking.status === "confirmed" && !booking.patientRating && !!(await finishedCall(booking._id)),
      score: booking.patientRating?.score, counselorName: booking.counselor?.name || "Counselor" });
  } catch (error) {
    console.error("Rating eligibility failed:", error);
    return res.status(500).json({ message: "Could not check rating eligibility." });
  }
}

export async function submitRating(req, res) {
  if (!patientAccess(req, res)) return;
  if (!mongoose.isValidObjectId(req.params.bookingId) || !validScore(req.body?.score)) {
    return res.status(400).json({ message: "Use a valid booking and a whole-number score from 1 to 5." });
  }
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, patient: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.patientRating) return res.status(409).json({ message: "This session has already been rated.", score: booking.patientRating.score });
    if (booking.status !== "confirmed" || !(await finishedCall(booking._id))) {
      return res.status(403).json({ message: "A connected call must be ended before you can rate this session." });
    }
    const saved = await Booking.findOneAndUpdate({
      _id: booking._id, patient: req.user.id, status: "confirmed", "patientRating.score": { $exists: false },
    }, { $set: { patientRating: { score: req.body.score, submittedAt: new Date() } } },
    { new: true, runValidators: true });
    if (!saved) {
      const current = await Booking.findOne({ _id: booking._id, patient: req.user.id });
      return res.status(409).json({ message: "Session changed or already rated. Please refresh.", score: current?.patientRating?.score });
    }
    return res.status(201).json({ success: true, score: saved.patientRating.score });
  } catch (error) {
    console.error("Rating submission failed:", error);
    return res.status(500).json({ message: "Could not save your rating." });
  }
}
