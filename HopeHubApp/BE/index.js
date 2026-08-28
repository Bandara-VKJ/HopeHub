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

import Booking from "./src/models/Booking.js";
import ChatMessage from "./src/models/ChatMessage.js";

import aiCounselingRoutes from "./src/routes/aiCounselingRoutes.js";


const app = express();


// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: "*",

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);


// ============================================================
// BODY PARSERS
// ============================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ============================================================
// UPLOADS
// ============================================================

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);


// ============================================================
// DATABASE
// ============================================================

connectDB();


// ============================================================
// TEST
// ============================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "HopeHub Backend is running",
    });
  }
);


// ============================================================
// EXISTING ROUTES
// ============================================================

app.use(
  "/api/questionnaire",
  questionnaireRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/counselors",
  counselorRoutes
);

app.use(
  "/api/family",
  familyRoutes
);

app.use(
  "/api/taks",
  taskRouter
);

app.use(
  "/api/diary",
  diaryRouter
);

app.use(
  "/api/risk",
  riskRouter
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/admin",
  adminRouter
);


// ============================================================
// CHAT API
// ============================================================

app.use(
  "/api/chat",
  chatRoutes
);


// ============================================================
// AI COUNSELING API
// ============================================================
//
// This is the ONLY new route registration.
//
// Frontend will use:
//
// GET
// /api/ai-counseling/conversation/:userId
//
// POST
// /api/ai-counseling/message
//
// DELETE
// /api/ai-counseling/conversation/:userId
//
// ============================================================

app.use(
  "/api/ai-counseling",
  aiCounselingRoutes
);


// ============================================================
// HTTP SERVER
// ============================================================

const server =
  http.createServer(app);


// ============================================================
// SOCKET.IO
// ============================================================

const io =
  new Server(server, {
    cors: {
      origin: "*",

      methods: [
        "GET",
        "POST",
      ],
    },

    transports: [
      "websocket",
      "polling",
    ],
  });


// ============================================================
// SOCKET CONNECTION
// ============================================================

io.on(
  "connection",
  (socket) => {

    console.log(
      "===================================="
    );

    console.log(
      "CHAT SOCKET CONNECTED"
    );

    console.log(
      "Socket ID:",
      socket.id
    );

    console.log(
      "===================================="
    );


    // ========================================================
    // JOIN BOOKING
    // ========================================================

    socket.on(
      "joinBooking",
      async ({
        bookingId,
        userId,
        role,
      }) => {

        try {

          if (
            !bookingId ||
            !userId ||
            !role
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "Booking ID, user ID and role are required.",
              }
            );

            return;
          }


          if (
            !["user", "counselor"].includes(
              role
            )
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "Invalid chat role.",
              }
            );

            return;
          }


          if (
            !mongooseSafeObjectId(
              bookingId
            ) ||
            !mongooseSafeObjectId(
              userId
            )
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "Invalid booking or user ID.",
              }
            );

            return;
          }


          const booking =
            await Booking.findById(
              bookingId
            );


          if (!booking) {
            socket.emit(
              "chatError",
              {
                message:
                  "Booking not found.",
              }
            );

            return;
          }


          // ==================================================
          // CONFIRMED ONLY
          // ==================================================

          if (
            booking.status !==
            "confirmed"
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "Chat is available only after the counselor confirms the booking.",
              }
            );

            return;
          }


          // ==================================================
          // CHECK ROLE + USER
          // ==================================================

          const isPatient =
            role === "user" &&
            String(
              booking.patient
            ) ===
              String(userId);


          const isCounselor =
            role === "counselor" &&
            String(
              booking.counselor
            ) ===
              String(userId);


          if (
            !isPatient &&
            !isCounselor
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "You are not authorized to access this chat.",
              }
            );

            return;
          }


          // ==================================================
          // ROOM
          // ==================================================

          const room =
            `booking_${bookingId}`;


          socket.join(room);


          // ==================================================
          // STORE SOCKET DATA
          // ==================================================

          socket.data.bookingId =
            String(
              bookingId
            );

          socket.data.userId =
            String(
              userId
            );

          socket.data.role =
            role;


          console.log(
            `${role} ${userId} joined ${room}`
          );


          socket.emit(
            "joinedBooking",
            {
              success: true,
              bookingId,
              role,
              room,
            }
          );

        } catch (error) {

          console.error(
            "JOIN BOOKING ERROR:",
            error
          );

          socket.emit(
            "chatError",
            {
              message:
                "Unable to join chat.",
            }
          );
        }
      }
    );


    // ========================================================
    // SEND MESSAGE
    // ========================================================

    socket.on(
      "sendMessage",
      async ({
        bookingId,
        message,
      }) => {

        try {

          const sender =
            socket.data.userId;

          const senderRole =
            socket.data.role;


          if (
            !bookingId ||
            !message ||
            !sender ||
            !senderRole
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "Missing message information.",
              }
            );

            return;
          }


          // ==================================================
          // MAKE SURE SOCKET IS USING SAME BOOKING
          // ==================================================

          if (
            socket.data.bookingId !==
            String(bookingId)
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "You are not connected to this booking.",
              }
            );

            return;
          }


          const cleanMessage =
            String(
              message
            ).trim();


          if (
            !cleanMessage
          ) {
            return;
          }


          if (
            cleanMessage.length >
            1000
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "Message is too long.",
              }
            );

            return;
          }


          // ==================================================
          // FIND BOOKING
          // ==================================================

          const booking =
            await Booking.findById(
              bookingId
            );


          if (!booking) {
            socket.emit(
              "chatError",
              {
                message:
                  "Booking not found.",
              }
            );

            return;
          }


          // ==================================================
          // CONFIRMED ONLY
          // ==================================================

          if (
            booking.status !==
            "confirmed"
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "You cannot send messages until the booking is confirmed.",
              }
            );

            return;
          }


          // ==================================================
          // CHECK SENDER
          // ==================================================

          const senderIsPatient =
            String(
              booking.patient
            ) ===
            String(sender);


          const senderIsCounselor =
            String(
              booking.counselor
            ) ===
            String(sender);


          if (
            !senderIsPatient &&
            !senderIsCounselor
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "You are not authorized to send messages in this booking.",
              }
            );

            return;
          }


          // ==================================================
          // CHECK ROLE
          // ==================================================

          if (
            senderIsPatient &&
            senderRole !==
              "user"
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "Invalid sender role.",
              }
            );

            return;
          }


          if (
            senderIsCounselor &&
            senderRole !==
              "counselor"
          ) {
            socket.emit(
              "chatError",
              {
                message:
                  "Invalid sender role.",
              }
            );

            return;
          }


          // ==================================================
          // DETERMINE RECEIVER
          // ==================================================

          const receiver =
            senderIsPatient
              ? booking.counselor
              : booking.patient;


          // ==================================================
          // SAVE MESSAGE
          // ==================================================

          const chatMessage =
            await ChatMessage.create({
              booking:
                bookingId,

              sender:
                sender,

              senderRole:
                senderRole,

              receiver:
                receiver,

              message:
                cleanMessage,

              isRead:
                false,
            });


          // ==================================================
          // SEND TO ROOM
          // ==================================================

          const room =
            `booking_${bookingId}`;


          io.to(room).emit(
            "newMessage",
            chatMessage
          );


          console.log(
            "CHAT MESSAGE SAVED:",
            chatMessage._id
          );

        } catch (error) {

          console.error(
            "SEND MESSAGE ERROR:",
            error
          );

          socket.emit(
            "chatError",
            {
              message:
                "Failed to send message.",
            }
          );
        }
      }
    );


    // ========================================================
    // TYPING
    // ========================================================

    socket.on(
      "typing",
      ({
        bookingId,
        userId,
      }) => {

        if (
          !bookingId ||
          !userId
        ) {
          return;
        }

        socket
          .to(
            `booking_${bookingId}`
          )
          .emit(
            "userTyping",
            {
              userId,
            }
          );
      }
    );


    // ========================================================
    // STOP TYPING
    // ========================================================

    socket.on(
      "stopTyping",
      ({
        bookingId,
        userId,
      }) => {

        if (
          !bookingId ||
          !userId
        ) {
          return;
        }

        socket
          .to(
            `booking_${bookingId}`
          )
          .emit(
            "userStoppedTyping",
            {
              userId,
            }
          );
      }
    );


    // ========================================================
    // DISCONNECT
    // ========================================================

    socket.on(
      "disconnect",
      (reason) => {

        console.log(
          "CHAT SOCKET DISCONNECTED:",
          socket.id,
          reason
        );
      }
    );
  }
);


// ============================================================
// OBJECT ID VALIDATOR
// ============================================================

function mongooseSafeObjectId(
  id
) {
  return /^[a-fA-F0-9]{24}$/.test(
    String(id)
  );
}


// ============================================================
// START SERVER
// ============================================================

const PORT =
  process.env.PORT ||
  5000;


server.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "===================================="
    );

    console.log(
      `HopeHub Backend running on port ${PORT}`
    );

    console.log(
      "Socket.IO chat server is ready"
    );

    console.log(
      "AI Counseling API is ready"
    );

    console.log(
      "===================================="
    );
  }
);