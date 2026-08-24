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
            label: {
                type: String,
                enum: ["GOOD", "BAD", "NEUTRAL"]
            },

            positivePercentage: {
                type: Number,
                min: 0,
                max: 100
            },

            negativePercentage: {
                type: Number,
                min: 0,
                max: 100
            },

            confidence: {
                type: Number,
                min: 0,
                max: 100
            }
        }
    },

    { timestamps: true }
);

export default mongoose.model("Diary", diarySchema);