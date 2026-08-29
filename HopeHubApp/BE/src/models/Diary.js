import mongoose from "mongoose";

const diarySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },

        date: {
            type: String,
            required: true
        },

        mood: {
            type: String,
            required: true,
            enum: ["good", "bad"],
            default: "good"
        },

        content: {
            type: String,
            required: true
        },

        emotionAnalysis: {
            dominantEmotion: {
                type: String
            },

            emotionPercentages: {
                type: Map,
                of: Number
            }
        }
    },

    { timestamps: true }
);

export default mongoose.model("Diary", diarySchema);