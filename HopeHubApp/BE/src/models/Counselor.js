import mongoose from "mongoose";

const counselorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    // Empty means unknown for legacy profiles. Registration requires a selection.
    counselingLanguages: {
      type: [{ type: String, enum: ["en", "si"] }],
      default: [],
      validate: {
        validator: values => values.length <= 2 && new Set(values).size === values.length,
        message: "Use unique language codes en and/or si",
      },
    },
    experience: { type: String, required: true, trim: true },
    availability: { type: String, default: "Available Today" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    topRated: { type: Boolean, default: false },
    avatar: { type: String, default: "CN" },
    avatarColor: { type: String, default: "#2CA6A4" },
    image: { type: String, default: "" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Counselor", counselorSchema);
