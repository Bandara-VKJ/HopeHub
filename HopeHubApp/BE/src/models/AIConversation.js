import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    /*
     * This field can later be used for
     * long-term AI memory summaries.
     */
    memorySummary: {
      type: String,
      default: "",
      trim: true,
    },

    lastTopic: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AIConversation = mongoose.model(
  "AIConversation",
  aiConversationSchema
);

export default AIConversation;