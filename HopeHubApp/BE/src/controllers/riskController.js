import User from '../models/User.js'

export const updateRisk = async (req, res) => {
  try {
    const { userId, counselorId } = req.params;
    const { level } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User Id required" });
    }
    if (!counselorId) {
      return res.status(400).json({ message: "Counselor Id required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.counselorLevel = level;
    user.counselorLevelBy = counselorId;
    user.counselorLevelAt = new Date();

    await user.save();

    res.status(200).json({
      message: "Level updated successfully",
      user,
    });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({
      message: "Failed to update addiction level",
    });
  }
};