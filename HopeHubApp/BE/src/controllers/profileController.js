import User from "../models/User.js";

// GET PROFILE
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

// UPDATE PROFILE
export const updateProfile = async(req, res) =>{
try {
  const { userId, firstName, lastName } = req.body;
  console.log("Body:", req.body);
  if (!userId){
    return res.status(400).json({message:"userId is required" })
  }

  let profilePic = undefined;

  if(req.file){
    profilePic = `/uploads/$(req.file.filename)`
  }

  const  updatedata = {firstName, lastName }

  if(profilePic)
  {
    updatedata.profilePic = profilePic
  }
  const user = await User.findByIdAndUpdate(
    userId,
   updatedata,
   {new : true}
  );

  if(!user)
  {
    return res.status(400).json({message: "User not found"});
  }
  console.log("File:", req.file);
  res.status(200).json({message: "Profile saved successfully", profile:{firstName: user.firstName, LastName: user.lastName, ProfilePic: user.profilePic},});
} catch (error) {
   console.log("updateProfile error:", error);
    res.status(500).json({ message: "Error saving profile" });
}
}