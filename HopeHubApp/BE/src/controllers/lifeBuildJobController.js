import LifeBuildJob from "../models/LifeBuildingJobQuestions.js";

export const saveJobProfile = async (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers) {
      return res.status(400).json({
        success: false,
        message: "userId and answers are required",
      });
    }

    const { age, gender, education, jobInterest, skills } = answers;

    const profile = await LifeBuildJob.findOneAndUpdate(
      { userId },
      {
        age,
        gender,
        education,
        jobInterest,
        ...(skills ? { skills } : {}),
        jobCompleted: true,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Job profile saved successfully",
      data: profile,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    console.error("saveJobProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving job profile",
    });
  }
};

export const getJobProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await LifeBuildJob.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Job profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("getJobProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching job profile",
    });
  }
};