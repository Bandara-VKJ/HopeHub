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

        source: {
            type: String,
            enum: ["diary", "questionnaire"],
            default: "diary"
        },

        questionnaire: {
            type: mongoose.Schema.Types.Mixed
        },

        emotionAnalysis: {
            dominantEmotion: {
                type: String
            },

            emotionPercentages: {
                type: mongoose.Schema.Types.Mixed
            }
        }
    },

    { timestamps: true }
);

export default mongoose.model("Diary", diarySchema);