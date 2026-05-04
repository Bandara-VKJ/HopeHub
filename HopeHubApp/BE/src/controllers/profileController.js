import User from "../models/User.js";

// GET PROFILE — reads directly from users collection
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ exists: false, profile: null });
    }

    res.status(200).json({
      exists: true,
      profile: {
        firstName:  user.firstName  || '',
        lastName:   user.lastName   || '',
        profilePic: user.profilePic || null,
      },
    });

  } catch (error) {
    console.log("getProfile error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// UPDATE PROFILE — saves directly into users collection
export const updateProfile = async (req, res) => {
  try {
    const { userId, firstName, lastName, profilePic } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, profilePic },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile saved successfully",
      profile: {
        firstName:  user.firstName,
        lastName:   user.lastName,
        profilePic: user.profilePic,
      },
    });

  } catch (error) {
    console.log("updateProfile error:", error);
    res.status(500).json({ message: "Error saving profile" });
  }
};