import LifeBuildAssessment from "../models/LifeBuildingScoreQuestions.js";

export const saveLifeBuildAssessment = async (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Assessment answers are required",
      });
    }

    // Validate all 20 questions
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

    // Calculate score
    const obtainedScore = Object.values(answers).reduce(
      (total, value) => total + Number(value),
      0
    );

    const maxScore = 20 * 5;

    const percentage = Math.round(
      (obtainedScore / maxScore) * 100
    );

    // All 20 questions have been completed
    const scoreCompleted = true;

    const assessment = await LifeBuildAssessment.create({
      userId,
      answers,
      obtainedScore,
      percentage,
      scoreCompleted,
    });

    return res.status(201).json({
      success: true,
      message: "LifeBuild assessment saved successfully",
      data: {
        assessmentId: assessment._id,
        obtainedScore,
        maxScore,
        percentage,
        scoreCompleted,
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

export const getLifeBuildScore = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

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
        scoreCompleted: assessment.scoreCompleted,
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
