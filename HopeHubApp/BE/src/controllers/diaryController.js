import Diary from '../models/Diary.js';
import axios from "axios";

const ML_DIARY_ENDPOINT =
    process.env.ML_DIARY_ENDPOINT || "http://127.0.0.1:8000/api/diary/predict";
const ML_TIMEOUT_MS = 8000;


const toEmotionAnalysis = (prediction) => {
    if (!prediction?.dominant_emotion || !prediction?.emotion_percentages) return null;
    return {
        dominantEmotion: prediction.dominant_emotion,
        emotionPercentages: prediction.emotion_percentages
    };
};

const predictEmotion = async (userId, text) => {
    try {
        const { data } = await axios.post(
            ML_DIARY_ENDPOINT,
            { userId, text },
            { timeout: ML_TIMEOUT_MS }
        );
        console.log("ML Result:", data);
        return toEmotionAnalysis(data);
    } catch (error) {
        console.log("ML prediction failed:", error.message);
        return null;
    }
};


const cleanClientAnalysis = (analysis) => {
    if (!analysis || typeof analysis.dominantEmotion !== "string") return null;
    const pcts = analysis.emotionPercentages;
    if (!pcts || typeof pcts !== "object" || Array.isArray(pcts)) return null;

    const cleaned = {};
    for (const [emotion, value] of Object.entries(pcts)) {
        const n = Number(value);
        if (Number.isFinite(n) && n >= 0 && n <= 100) cleaned[emotion] = n;
    }
    if (!(analysis.dominantEmotion in cleaned)) return null;

    return { dominantEmotion: analysis.dominantEmotion, emotionPercentages: cleaned };
};


export const addDiary = async (req, res) => {
    try {

        const {
            userId, date, mood, content,
            source, questionnaire, emotionAnalysis: clientAnalysis
        } = req.body;

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

        const isQuick = source === "questionnaire";

        let emotionAnalysis = isQuick ? cleanClientAnalysis(clientAnalysis) : null;
        if (!emotionAnalysis) {
            emotionAnalysis = await predictEmotion(userId, content);
        }

        const diary = new Diary({
            userId,
            date,
            mood,
            content,
            source: isQuick ? "questionnaire" : "diary",
            ...(isQuick && questionnaire ? { questionnaire } : {}),
            ...(emotionAnalysis ? { emotionAnalysis } : {})
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

        const diaries = await Diary.find({
            userId,
            date: {
                $gte: lastWeekString,
                $lte: todayString
            }
        }).lean();

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

        if (diary.source === "questionnaire") {
            return res.status(403).json({
                message: "Quick check-ins cannot be edited"
            });
        }

        if (!mood || !content) {
            return res.status(400).json({
                message: "Mood and content are required"
            });
        }

        const emotionAnalysis = await predictEmotion(userId, content);

        diary.mood = mood;
        diary.content = content;

        if (emotionAnalysis) {
            diary.emotionAnalysis = emotionAnalysis;
        }

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

const WEEK_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const lastWeekKeys = (now = new Date()) =>
    Array.from({ length: WEEK_DAYS }, (_, i) =>
        new Date(now.getTime() - (WEEK_DAYS - 1 - i) * DAY_MS)
            .toISOString()
            .split("T")[0]
    );


const buildWeekEmotions = (diaries, now = new Date()) => {
    const keys = lastWeekKeys(now);
    const byDay = new Map(
        keys.map((key) => [key, { entryCount: 0, analysed: 0, totals: {} }])
    );

    for (const diary of diaries) {
        const day = byDay.get(diary.date);
        if (!day) continue;

        day.entryCount += 1;

        const percentages = diary.emotionAnalysis?.emotionPercentages;
        if (!percentages) continue;

        day.analysed += 1;
        for (const [emotion, pct] of Object.entries(percentages)) {
            day.totals[emotion] = (day.totals[emotion] || 0) + (Number(pct) || 0);
        }
    }

    return keys.map((date) => {
        const { entryCount, analysed, totals } = byDay.get(date);

        // highest first; ties are broken alphabetically so the result is stable
        const ranked = Object.entries(totals).sort(
            (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
        );

        if (analysed === 0 || ranked.length === 0) {
            return { date, dominantEmotion: null, percentage: 0, entryCount };
        }

        const [dominantEmotion, total] = ranked[0];
        return {
            date,
            dominantEmotion,
            percentage: Math.round(total / analysed),
            entryCount
        };
    });
};

export const weekDiary = async (req, res) => {
    try {
        const { counselorId, userId } = req.params;
 
        if (!counselorId) {
            return res.status(401).json({ message: "counselor Id is required" });
        }
 
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }
 
        const now = new Date();
        const keys = lastWeekKeys(now);
 
        const diaries = await Diary.find({
            userId,
            date: {
                $gte: keys[0],
                $lte: keys[keys.length - 1]
            }
        })
            .select("date emotionAnalysis")
            .lean();
 
        return res.status(200).json({
            message: "Weekly emotions retrieved successfully",
            days: buildWeekEmotions(diaries, now)
        });
 
    } catch (error) {
        console.log("error:", error);
 
        return res.status(500).json({
            message: "Failed to retrieve weekly emotions"
        });
    }
};