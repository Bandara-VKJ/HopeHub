import "dotenv/config";
import mongoose from "mongoose";
import CallSession from "../src/models/CallSession.js";

try {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing.");
  await mongoose.connect(process.env.MONGO_URI);
  await CallSession.createIndexes();
  console.log("Call-rating indexes are ready.");
} catch (error) {
  console.error("Could not create call-rating indexes:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
