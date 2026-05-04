import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  profilePic: String, // base64 or URL
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Profile", profileSchema);