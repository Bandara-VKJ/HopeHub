import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import connectDB from "./src/config/db.js";
import questionnaireRoutes from "./src/routes/QuestionnaireRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import counselorRoutes from "./src/routes/CounselorRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/counselors", counselorRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});