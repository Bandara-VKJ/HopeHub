import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./src/config/db.js";

import questionnaireRoutes from "./src/routes/QuestionnaireRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import counselorRoutes from "./src/routes/CounselorRoutes.js";
import familyRoutes from "./src/routes/familyRouter.js";
import taskRouter from "./src/routes/taskRoutes.js";
import diaryRouter from "./src/routes/diaryRouter.js";
import riskRouter from "./src/routes/riskRouter.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import adminRouter from "./src/routes/adminRoutes.js";
import aiCounselingRoutes from "./src/routes/aiCounselingRoutes.js";
import lifeBuildScoreRouter from "./src/routes/lifeBuildScoreRouter.js"
import Booking from "./src/models/Booking.js";
import ChatMessage from "./src/models/ChatMessage.js";
import jobRouter from "./src/routes/jobRouter.js"

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.json({ success: true, message: "HopeHub Backend is running" });
});

app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/taks", taskRouter);
app.use("/api/diary", diaryRouter);
app.use("/api/risk", riskRouter);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/ai-counseling", aiCounselingRoutes);
app.use("/api/lifeBuild", lifeBuildScoreRouter);
app.use("/api/job", jobRouter);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

app.set("io", io);

const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(String(id));

io.on("connection", (socket) => {
  console.log("CHAT SOCKET CONNECTED:", socket.id);

  socket.on("joinCounselorRoom", (counselorId) => {
    if (!counselorId) {
      console.log("Counselor room join rejected: counselor ID missing.");
      return;
    }

    const room = `counselor_${String(counselorId)}`;
    socket.join(room);
    socket.data.counselorId = String(counselorId);

    console.log(`Counselor ${counselorId} joined notification room: ${room}`);
    socket.emit("joinedCounselorRoom", {
      success: true,
      counselorId: String(counselorId),
      room,
    });
  });

  socket.on("joinBooking", async ({ bookingId, userId, role }) => {
    try {
      if (!bookingId || !userId || !role) {
        return socket.emit("chatError", { message: "Booking ID, user ID and role are required." });
      }

      if (!["user", "counselor"].includes(role)) {
        return socket.emit("chatError", { message: "Invalid chat role." });
      }

      if (!isValidObjectId(bookingId) || !isValidObjectId(userId)) {
        return socket.emit("chatError", { message: "Invalid booking or user ID." });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return socket.emit("chatError", { message: "Booking not found." });
      }

      if (booking.status !== "confirmed") {
        return socket.emit("chatError", {
          message: "Chat is available only after the counselor confirms the booking.",
        });
      }

      const isPatient = role === "user" && String(booking.patient) === String(userId);
      const isCounselor = role === "counselor" && String(booking.counselor) === String(userId);

      if (!isPatient && !isCounselor) {
        return socket.emit("chatError", { message: "You are not authorized to access this chat." });
      }

      const room = `booking_${bookingId}`;
      socket.join(room);

      socket.data.bookingId = String(bookingId);
      socket.data.userId = String(userId);
      socket.data.role = role;

      console.log(`${role} ${userId} joined ${room}`);
      socket.emit("joinedBooking", { success: true, bookingId, role, room });
    } catch (error) {
      console.error("JOIN BOOKING ERROR:", error);
      socket.emit("chatError", { message: "Unable to join chat." });
    }
  });

  socket.on("sendMessage", async ({ bookingId, message }) => {
    try {
      const sender = socket.data.userId;
      const senderRole = socket.data.role;

      if (!bookingId || !message || !sender || !senderRole) {
        return socket.emit("chatError", { message: "Missing message information." });
      }

      if (socket.data.bookingId !== String(bookingId)) {
        return socket.emit("chatError", { message: "You are not connected to this booking." });
      }

      const cleanMessage = String(message).trim();

      if (!cleanMessage) return;

      if (cleanMessage.length > 1000) {
        return socket.emit("chatError", { message: "Message is too long." });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return socket.emit("chatError", { message: "Booking not found." });
      }

      if (booking.status !== "confirmed") {
        return socket.emit("chatError", {
          message: "You cannot send messages until the booking is confirmed.",
        });
      }

      const senderIsPatient = String(booking.patient) === String(sender);
      const senderIsCounselor = String(booking.counselor) === String(sender);

      if (!senderIsPatient && !senderIsCounselor) {
        return socket.emit("chatError", {
          message: "You are not authorized to send messages in this booking.",
        });
      }

      if (
        (senderIsPatient && senderRole !== "user") ||
        (senderIsCounselor && senderRole !== "counselor")
      ) {
        return socket.emit("chatError", { message: "Invalid sender role." });
      }

      const receiver = senderIsPatient ? booking.counselor : booking.patient;

      const chatMessage = await ChatMessage.create({
        booking: bookingId,
        sender,
        senderRole,
        receiver,
        message: cleanMessage,
        isRead: false,
      });

      io.to(`booking_${bookingId}`).emit("newMessage", chatMessage);

      console.log("CHAT MESSAGE SAVED:", chatMessage._id);
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
      socket.emit("chatError", { message: "Failed to send message." });
    }
  });

  socket.on("typing", ({ bookingId, userId }) => {
    if (!bookingId || !userId) return;
    socket.to(`booking_${bookingId}`).emit("userTyping", { userId });
  });

  socket.on("stopTyping", ({ bookingId, userId }) => {
    if (!bookingId || !userId) return;
    socket.to(`booking_${bookingId}`).emit("userStoppedTyping", { userId });
  });

  socket.on("disconnect", (reason) => {
    console.log("CHAT SOCKET DISCONNECTED:", socket.id, reason);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HopeHub Backend running on port ${PORT}`);
  console.log("Socket.IO chat server is ready");
  console.log("AI Counseling API is ready");
});