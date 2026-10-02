import LifeBuildAssessment from "../models/LifeBuildingScoreQuestions.js";

// POST - Save assessment and calculate score
export const saveLifeBuildAssessment = async (req, res) => {
  try {
    const { userId, answers } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Validate answers
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Assessment answers are required",
      });
    }

    // Make sure all 20 questions are answered
    for (let i = 1; i <= 20; i++) {
      const answer = answers[`q${i}`];

      if (
        answer === undefined ||
        answer === null ||
        ![1, 2, 3, 4, 5].includes(Number(answer))
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing answer for q${i}`,
        });
      }
    }

    // Calculate obtained score
    const obtainedScore = Object.values(answers).reduce(
      (total, value) => total + Number(value),
      0
    );

    // Maximum score = 20 questions × 5
    const maxScore = 20 * 5;

    // Calculate percentage
    const percentage = Math.round(
      (obtainedScore / maxScore) * 100
    );

    // Save to MongoDB
    const assessment = await LifeBuildAssessment.create({
      userId,
      answers,
      obtainedScore,
      percentage,
    });

    return res.status(201).json({
      success: true,
      message: "LifeBuild assessment saved successfully",
      data: {
        assessmentId: assessment._id,
        obtainedScore,
        maxScore,
        percentage,
      },
    });
  } catch (error) {
    console.error("Save LifeBuild Assessment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save LifeBuild assessment",
      error: error.message,
    });
  }
};


// GET - Get latest score for a user
export const getLifeBuildScore = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Get latest assessment for this user
    const assessment = await LifeBuildAssessment
      .findOne({ userId })
      .sort({ createdAt: -1 });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "No LifeBuild assessment found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        assessmentId: assessment._id,
        obtainedScore: assessment.obtainedScore,
        maxScore: 100,
        percentage: assessment.percentage,
        createdAt: assessment.createdAt,
      },
    });
  } catch (error) {
    console.error("Get LifeBuild Score Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get LifeBuild score",
      error: error.message,
    });
  }
};
