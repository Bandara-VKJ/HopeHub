import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cors from "cors";
import questionnaireRoutes from "./src/routes/QuestionnaireRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/questionnaire", questionnaireRoutes);

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});