import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["invited", "active", "revoked"], default: "invited" },
    inviteToken: String,
    inviteTokenExpires: Date,
    passwordHash: String,
  },
  { timestamps: true }
);

export default mongoose.model("FamilyMember", familyMemberSchema);