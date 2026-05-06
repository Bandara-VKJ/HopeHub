import mongoose from "mongoose";

const counselorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    specialty: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    availability: {
      type: String,
      default: "Available Today",
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: Number,
      default: 0,
    },

    available: {
      type: Boolean,
      default: true,
    },

    topRated: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String,
      default: "CN",
    },

    avatarColor: {
      type: String,
      default: "#2CA6A4",
    },

    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Counselor", counselorSchema);