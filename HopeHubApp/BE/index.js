import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());


app.use(cors());

connectDB();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});