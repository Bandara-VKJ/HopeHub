import {
  AccessToken,
  TokenVerifier,
} from "livekit-server-sdk";
import mongoose from "mongoose";

import Booking from "../models/Booking.js";

export const createVoiceToken = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // =====================================================
    // VALIDATE BOOKING ID
    // =====================================================

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // =====================================================
    // AUTHENTICATED USER FROM JWT
    // =====================================================

    const authenticatedId =
      req.user?.id ||
      req.user?._id;

    const authenticatedRole =
      req.user?.role;

    if (!authenticatedId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID was not found.",
      });
    }

    if (
      authenticatedRole !== "user" &&
      authenticatedRole !== "counselor"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only users and counselors can join voice sessions.",
      });
    }

    // =====================================================
    // CHECK LIVEKIT CONFIGURATION
    // =====================================================

    const livekitUrl =
      process.env.LIVEKIT_URL;

    const apiKey =
      process.env.LIVEKIT_API_KEY;

    const apiSecret =
      process.env.LIVEKIT_API_SECRET;

    if (
      !livekitUrl ||
      !apiKey ||
      !apiSecret
    ) {
      console.error(
        "LiveKit environment variables are missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "Voice service is not configured.",
      });
    }

    // =====================================================
    // FIND BOOKING
    // =====================================================

    const booking =
      await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // =====================================================
    // BOOKING MUST BE CONFIRMED
    // =====================================================

    if (booking.status !== "confirmed") {
      return res.status(403).json({
        success: false,
        message:
          "Voice calling is available only for confirmed bookings.",
      });
    }

    // =====================================================
    // VERIFY PARTICIPANT
    // =====================================================

    const isPatient =
      authenticatedRole === "user" &&
      String(booking.patient) ===
        String(authenticatedId);

    const isCounselor =
      authenticatedRole === "counselor" &&
      String(booking.counselor) ===
        String(authenticatedId);

    if (!isPatient && !isCounselor) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to join this voice session.",
      });
    }

    // =====================================================
    // CREATE PRIVATE ROOM NAME
    // =====================================================

    const roomName =
      `voice_${String(booking._id)}`;

    const participantIdentity =
      authenticatedRole === "counselor"
        ? `c_${String(authenticatedId)}`
        : `u_${String(authenticatedId)}`;

    // =====================================================
    // CREATE LIVEKIT TOKEN
    // =====================================================

    const accessToken =
      new AccessToken(
        apiKey,
        apiSecret,
        {
          identity:
            participantIdentity,

          ttl: "1h",
        }
      );

    accessToken.addGrant({
      roomJoin: true,

      room: roomName,

      canPublish: true,

      canSubscribe: true,

      canPublishData: false,
    });

    const token =
      await accessToken.toJwt();

      try {
  const verifier = new TokenVerifier(
    apiKey,
    apiSecret
  );

  const verified = await verifier.verify(token);

  console.log("LIVEKIT TOKEN VERIFIED:", {
    identity: verified.sub,
    issuerMatches: verified.iss === apiKey,
    room: verified.video?.room,
    roomJoin: verified.video?.roomJoin,
    expiresAt: verified.exp,
  });
} catch (verifyError) {
  console.error(
    "LIVEKIT TOKEN VERIFICATION FAILED:",
    verifyError
  );
}
    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      serverUrl:
        livekitUrl,

      token,

      roomName,

      participantIdentity,

      bookingId:
        String(booking._id),

      role:
        authenticatedRole,
    });
  } catch (error) {
    console.error(
      "CREATE VOICE TOKEN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create voice session.",
    });
  }
};