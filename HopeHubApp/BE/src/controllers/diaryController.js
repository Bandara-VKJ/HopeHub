import Diary from '../models/Diary.js';
import axios from "axios";

export const addDiary = async (req, res) => {
    try {

        const { userId, date, mood, content } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID was not identified"
            });
        }

        if (!date || !mood || !content) {
            return res.status(400).json({
                message: "Please fill & select all fields"
            });
        }

        const mlResponse = await axios.post(
            "http://127.0.0.1:8000/predict",
            {
                text: content
            }
        );

        const prediction = mlResponse.data;

        console.log("ML Result:", prediction);

        const diary = new Diary({
            userId,
            date,
            mood,
            content,

            emotionAnalysis: {
                label: prediction.label,
                positivePercentage: prediction.positive_percentage,
                negativePercentage: prediction.negative_percentage,
                confidence: prediction.confidence
            }
        });

        await diary.save();

        return res.status(201).json({
            message: "Diary saved successfully",
            diary
        });

    } catch (error) {

        console.log("error:", error);

        return res.status(500).json({
            message: "User diary failed to save",
            error: error.message
        });
    }
};

export const getDiaries = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId)
        {
            return res.status(400).json({
            message: "User ID was not identified"
            });
        }

        const today = new Date();
        
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);

         const todayString = today.toISOString().split("T")[0];
         const lastWeekString = lastWeek.toISOString().split("T")[0];

        const  diaries = await Diary.find({
            userId,
            date: {
                $gte: lastWeekString,
                $lte: todayString
            }
        });

        res.status(200).json({
            message: "Diaries retrieved successfully",
            diaries
        });

    } catch (error) {
         console.log("error:", error);
        res.status(500).json({
        message: "User diary fail to retrieve ",
        });
    }
}

export const editDiary = async (req, res) => {
    try {

        const { userId, diaryId } = req.params;
        const { mood, content } = req.body;

        const today = new Date()
            .toISOString()
            .split("T")[0];

        const diary = await Diary.findOne({
            _id: diaryId,
            userId: userId
        });

        if (!diary) {
            return res.status(404).json({
                message: "Diary not found"
            });
        }

        if (diary.date !== today) {
            return res.status(403).json({
                message: "You can only edit today's diary"
            });
        }

        if (!mood || !content) {
            return res.status(400).json({
                message: "Mood and content are required"
            });
        }

        const mlResponse = await axios.post(
            "http://127.0.0.1:8000/predict",
            {
                text: content
            }
        );

        const prediction = mlResponse.data;

        console.log("Updated ML Result:", prediction);

        diary.mood = mood;
        diary.content = content;

        diary.emotionAnalysis = {
            label: prediction.label,
            positivePercentage: prediction.positive_percentage,
            negativePercentage: prediction.negative_percentage,
            confidence: prediction.confidence
        };

        await diary.save();

        res.status(200).json({
            message: "Diary updated successfully",
            diary
        });

    } catch (error) {

        console.log("error:", error);

        res.status(500).json({
            message: "Failed to update diary",
            error: error.message
        });
    }
};

export const deleteDiary = async (req, res) => {
    try {
        const { userId, diaryId } = req.params;

        const today = new Date().toISOString().split("T")[0];

        const diary = await Diary.findOne({
            _id: diaryId,
            userId: userId
        });

        if (!diary) {
            return res.status(404).json({
                message: "Diary not found"
            });
        }

        if (diary.date !== today) {
            return res.status(403).json({
                message: "You can only delete today's diary"
            });
        }

        await Diary.findByIdAndDelete(diaryId);

        res.status(200).json({
            message: "Diary deleted successfully"
        });

    } catch (error) {
        console.log("error:", error);

        res.status(500).json({
            message: "Failed to delete diary"
        });
    }
};
