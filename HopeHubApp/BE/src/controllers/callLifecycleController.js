import mongoose from "mongoose";
import { RoomServiceClient, ParticipantInfo_State } from "livekit-server-sdk";
import Booking from "../models/Booking.js";
import CallSession from "../models/CallSession.js";

function service() {
  const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) throw new Error("LiveKit is not configured");
  return new RoomServiceClient(LIVEKIT_URL.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
}

async function authorizedBooking(req, res) {
  const id = req.params.bookingId;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid booking ID." }); return null;
  }
  const booking = await Booking.findById(id);
  const userId = req.user?.id || req.user?._id;
  const allowed = booking && (
    (req.user?.role === "user" && String(booking.patient) === String(userId)) ||
    (req.user?.role === "counselor" && String(booking.counselor) === String(userId))
  );
  if (!allowed) { res.status(404).json({ message: "Booking not found." }); return null; }
  return booking;
}

function readSid(req, res) {
  const sid = req.body?.roomSid || req.query.roomSid;
  if (typeof sid !== "string" || !/^RM_[A-Za-z0-9_-]{1,100}$/.test(sid)) {
    res.status(400).json({ message: "A valid room SID is required." }); return null;
  }
  return sid;
}

async function liveRoom(client, booking, sid) {
  // Both existing voice and video screens use this token endpoint and room prefix.
  const name = `voice_${booking._id}`;
  const rooms = await client.listRooms([name]);
  const room = rooms.find((item) => item.sid === sid && item.name === name);
  return room ? { name, participants: await client.listParticipants(name) } : null;
}

function bothPresent(booking, participants) {
  const identities = new Set(participants.filter(item => item.state === ParticipantInfo_State.ACTIVE).map((item) => item.identity));
  return identities.has(`u_${booking.patient}`) && identities.has(`c_${booking.counselor}`);
}

async function rememberConnected(booking, sid) {
  // Concurrent verification from both devices is safe under the compound unique index.
  try {
    return await CallSession.findOneAndUpdate({ booking: booking._id, roomSid: sid },
      { $setOnInsert: { booking: booking._id, roomSid: sid }, $min: { connectedAt: new Date() } },
      { upsert: true, new: true, runValidators: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return CallSession.findOne({ booking: booking._id, roomSid: sid });
  }
}

export async function verifyCallConnected(req, res) {
  try {
    const booking = await authorizedBooking(req, res); if (!booking) return;
    const sid = readSid(req, res); if (!sid) return;
    if (booking.status !== "confirmed") return res.status(403).json({ message: "Booking is not confirmed." });
    const live = await liveRoom(service(), booking, sid);
    if (!live || !bothPresent(booking, live.participants)) return res.json({ connected: false });
    await rememberConnected(booking, sid);
    return res.json({ connected: true });
  } catch (error) {
    console.error("Call verification failed:", error);
    return res.status(503).json({ message: "Unable to verify the connected call." });
  }
}

export async function endVerifiedCall(req, res) {
  try {
    const booking = await authorizedBooking(req, res); if (!booking) return;
    const sid = readSid(req, res); if (!sid) return;
    const client = service();
    const live = await liveRoom(client, booking, sid);
    let evidence = await CallSession.findOne({ booking: booking._id, roomSid: sid });
    if (live) {
      const identity = `${req.user.role === "user" ? "u" : "c"}_${req.user.id || req.user._id}`;
      if (!live.participants.some((item) => item.identity === identity)) {
        return res.status(403).json({ message: "You are not in this call." });
      }
      if (booking.status === "confirmed" && bothPresent(booking, live.participants)) {
        evidence = await rememberConnected(booking, sid);
      }
      // Delete the room so End Call actually ends it for both people.
      // An old request cannot delete a new call with a different SID.
      const stillCurrent = (await client.listRooms([live.name])).some((item) => item.sid === sid);
      if (!stillCurrent) return res.status(409).json({ message: "Call changed. Please retry." });
      try { await client.deleteRoom(live.name); }
      catch (error) {
        // Two users may end at once. Treat an already-removed room as success,
        // but do not hide a failed deletion while this call still exists.
        const remaining = await client.listRooms([live.name]);
        if (remaining.some((item) => item.sid === sid)) throw error;
      }
    }
    if (evidence?.connectedAt) {
      await CallSession.updateOne({ _id: evidence._id, endedAt: { $exists: false } }, { $set: { endedAt: new Date() } });
    }
    return res.json({ ended: true,
      eligible: !!evidence?.connectedAt && booking.status === "confirmed" && !booking.patientRating });
  } catch (error) {
    console.error("End call failed:", error);
    return res.status(503).json({ message: "Could not confirm the end of the call. Please try again." });
  }
}

export async function getCallStatus(req, res) {
  try {
    const booking = await authorizedBooking(req, res); if (!booking) return;
    const sid = readSid(req, res); if (!sid) return;
    const call = await CallSession.findOne({ booking: booking._id, roomSid: sid }).lean();
    return res.json({ ended: !!call?.endedAt,
      eligible: !!call?.connectedAt && !!call?.endedAt && booking.status === "confirmed" && !booking.patientRating });
  } catch (error) {
    console.error("Call status failed:", error);
    return res.status(503).json({ message: "Unable to check this call." });
  }
}
