import Counselor from "../models/Counselor.js";
import bcrypt from "bcryptjs";

const safeCounselor = (counselor) => ({
  _id: counselor._id,
  firstName: counselor.firstName,
  lastName: counselor.lastName,
  name: counselor.name,
  email: counselor.email,
  mobile: counselor.mobile,
  title: counselor.title,
  specialty: counselor.specialty,
  experience: counselor.experience,
  availability: counselor.availability,
  rating: counselor.rating,
  reviews: counselor.reviews,
  available: counselor.available,
  topRated: counselor.topRated,
  avatar: counselor.avatar,
  avatarColor: counselor.avatarColor,
  image: counselor.image,
  createdAt: counselor.createdAt,
});

export const registerCounselor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      mobile,
      title,
      specialty,
      experience,
      availability,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !mobile ||
      !title ||
      !specialty ||
      !experience
    ) {
      return res.status(400).json({
        message: "Please fill all counselor fields",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const exists = await Counselor.findOne({ email: cleanEmail });

    if (exists) {
      return res.status(400).json({
        message: "Counselor email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const name = `${firstName} ${lastName}`;
    const avatar = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    const counselor = await Counselor.create({
      firstName,
      lastName,
      name,
      email: cleanEmail,
      password: hashedPassword,
      mobile,
      title,
      specialty,
      experience,
      availability: availability || "Available Today",
      available: true,
      topRated: false,
      rating: 0,
      reviews: 0,
      avatar,
      avatarColor: "#2CA6A4",
    });

    res.status(201).json({
      message: "Counselor registered successfully",
      counselor: safeCounselor(counselor),
      user: safeCounselor(counselor),
    });
  } catch (error) {
    console.log("registerCounselor error:", error);
    res.status(500).json({
      message: "Counselor registration failed",
    });
  }
};

export const loginCounselor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const counselor = await Counselor.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!counselor) {
      return res.status(404).json({
        message: "Counselor not found",
      });
    }

    const isMatch = await bcrypt.compare(password, counselor.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    res.status(200).json({
      message: "Counselor login successful",
      counselor: safeCounselor(counselor),
      user: safeCounselor(counselor),
    });
  } catch (error) {
    console.log("loginCounselor error:", error);
    res.status(500).json({
      message: "Counselor login failed",
    });
  }
};

export const getCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(counselors);
  } catch (error) {
    console.log("getCounselors error:", error);
    res.status(500).json({
      message: "Failed to fetch counselors",
    });
  }
};

export const getCounselorById = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id).select("-password");

    if (!counselor) {
      return res.status(404).json({
        message: "Counselor not found",
      });
    }

    res.status(200).json(safeCounselor(counselor));
  } catch (error) {
    console.log("getCounselorById error:", error);
    res.status(500).json({
      message: "Failed to fetch counselor",
    });
  }
};

export const updateCounselorAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    if (typeof available !== "boolean") {
      return res.status(400).json({
        message: "available must be true or false",
      });
    }

    const counselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      {
        available,
        availability: available ? "Available Today" : "Busy",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!counselor) {
      return res.status(404).json({
        message: "Counselor not found",
      });
    }

    res.status(200).json({
      message: "Availability updated",
      counselor: safeCounselor(counselor),
      user: safeCounselor(counselor),
    });
  } catch (error) {
    console.log("Update availability error:", error);
    res.status(500).json({
      message: "Failed to update availability",
    });
  }
};