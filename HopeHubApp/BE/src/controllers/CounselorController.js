import Counselor from "../models/Counselor.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ============================================================
// TOKEN
// ============================================================

const generateToken = (counselor) => {
  return jwt.sign(
    {
      id: counselor._id,
      role: "counselor",
    },
    process.env.JWT_SECRET || "hopehub_secret",
    {
      expiresIn: "7d",
    }
  );
};


// ============================================================
// SAFE COUNSELOR
// ============================================================

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

  approvalStatus: counselor.approvalStatus,

  approvedAt: counselor.approvedAt,
  rejectedAt: counselor.rejectedAt,

  createdAt: counselor.createdAt,
});


// ============================================================
// REGISTER COUNSELOR
// ============================================================

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

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const exists = await Counselor.findOne({
      email: cleanEmail,
    });

    if (exists) {
      return res.status(400).json({
        message:
          "Counselor email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const name =
      `${firstName.trim()} ${lastName.trim()}`;

    const avatar =
      `${firstName.charAt(0)}${lastName.charAt(
        0
      )}`.toUpperCase();

    const counselor =
      await Counselor.create({
        firstName: firstName.trim(),

        lastName: lastName.trim(),

        name,

        email: cleanEmail,

        password: hashedPassword,

        mobile: mobile.trim(),

        title: title.trim(),

        specialty: specialty.trim(),

        experience: experience.trim(),

        availability:
          availability?.trim() ||
          "Available Today",

        available: true,

        topRated: false,

        rating: 0,

        reviews: 0,

        avatar,

        avatarColor: "#2CA6A4",

        // Counselor must wait for
        // HopeHub System approval
        approvalStatus: "pending",

        approvedAt: null,

        rejectedAt: null,
      });

    // IMPORTANT:
    // Do NOT create a token here.
    // Counselor must first receive
    // HopeHub System approval.

    return res.status(201).json({
      success: true,

      message:
        "Counselor account created successfully. Please wait for HopeHub System approval.",

      approvalStatus: "pending",

      counselor:
        safeCounselor(counselor),
    });
  } catch (error) {
    console.log(
      "registerCounselor error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Counselor registration failed",

      error: error.message,
    });
  }
};


// ============================================================
// COUNSELOR LOGIN
// ============================================================

export const loginCounselor = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const counselor =
      await Counselor.findOne({
        email: cleanEmail,
      });

    if (!counselor) {
      return res.status(404).json({
        message: "Counselor not found",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        counselor.password
      );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }


    // ========================================================
    // HOPEHUB SYSTEM APPROVAL CHECK
    // ========================================================

    if (
      counselor.approvalStatus ===
      "pending"
    ) {
      return res.status(403).json({
        success: false,

        approvalStatus: "pending",

        message:
          "Your account is waiting for HopeHub System approval. You cannot access the system yet.",
      });
    }


    if (
      counselor.approvalStatus ===
      "rejected"
    ) {
      return res.status(403).json({
        success: false,

        approvalStatus: "rejected",

        message:
          "Your counselor account has been rejected by the HopeHub System. You cannot access the system.",
      });
    }


    if (
      counselor.approvalStatus !==
      "approved"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Your counselor account does not have permission to access the system.",
      });
    }


    // ========================================================
    // ONLY APPROVED COUNSELORS REACH HERE
    // ========================================================

    const token =
      generateToken(counselor);

    return res.status(200).json({
      success: true,

      message:
        "Counselor login successful",

      token,

      counselor:
        safeCounselor(counselor),

      user:
        safeCounselor(counselor),
    });
  } catch (error) {
    console.log(
      "loginCounselor error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Counselor login failed",

      error: error.message,
    });
  }
};


// ============================================================
// ADMIN - GET COUNSELORS
// ============================================================

export const getCounselorsForAdmin =
  async (req, res) => {
    try {
      const counselors =
        await Counselor.find()
          .select("-password")
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count: counselors.length,

        counselors,
      });
    } catch (error) {
      console.log(
        "getCounselorsForAdmin error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch counselors",
      });
    }
  };


// ============================================================
// ADMIN - APPROVE COUNSELOR
// ============================================================

export const approveCounselor =
  async (req, res) => {
    try {
      const counselor =
        await Counselor.findById(
          req.params.id
        );

      if (!counselor) {
        return res.status(404).json({
          success: false,

          message:
            "Counselor not found",
        });
      }

      counselor.approvalStatus =
        "approved";

      counselor.approvedAt =
        new Date();

      counselor.rejectedAt = null;

      await counselor.save();

      return res.status(200).json({
        success: true,

        message:
          "Counselor access approved successfully",

        counselor:
          safeCounselor(counselor),
      });
    } catch (error) {
      console.log(
        "approveCounselor error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to approve counselor",
      });
    }
  };


// ============================================================
// ADMIN - CANCEL COUNSELOR ACCESS
// ============================================================

export const rejectCounselor =
  async (req, res) => {
    try {
      const counselor =
        await Counselor.findById(
          req.params.id
        );

      if (!counselor) {
        return res.status(404).json({
          success: false,

          message:
            "Counselor not found",
        });
      }

      counselor.approvalStatus =
        "rejected";

      counselor.rejectedAt =
        new Date();

      counselor.approvedAt = null;

      await counselor.save();

      return res.status(200).json({
        success: true,

        message:
          "Counselor access cancelled successfully",

        counselor:
          safeCounselor(counselor),
      });
    } catch (error) {
      console.log(
        "rejectCounselor error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to cancel counselor access",
      });
    }
  };


// ============================================================
// ADMIN - DELETE COUNSELOR ACCOUNT
// ============================================================

export const deleteCounselor =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,

          message:
            "Counselor ID is required",
        });
      }

      const counselor =
        await Counselor.findById(id);

      if (!counselor) {
        return res.status(404).json({
          success: false,

          message:
            "Counselor account not found",
        });
      }

      await Counselor.findByIdAndDelete(
        id
      );

      return res.status(200).json({
        success: true,

        message:
          "Counselor account deleted successfully from the HopeHub System",
      });
    } catch (error) {
      console.error(
        "deleteCounselor error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to delete counselor account",

        error: error.message,
      });
    }
  };


// ============================================================
// GET ALL COUNSELORS
// ============================================================

export const getCounselors =
  async (req, res) => {
    try {
      // Only approved counselors
      // should appear to users.
      const counselors =
        await Counselor.find({
          approvalStatus: "approved",
        })
          .select("-password")
          .sort({
            createdAt: -1,
          });

      return res
        .status(200)
        .json(counselors);
    } catch (error) {
      console.log(
        "getCounselors error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch counselors",
      });
    }
  };


// ============================================================
// GET COUNSELOR BY ID
// ============================================================

export const getCounselorById =
  async (req, res) => {
    try {
      const counselor =
        await Counselor.findById(
          req.params.id
        ).select("-password");

      if (!counselor) {
        return res.status(404).json({
          message:
            "Counselor not found",
        });
      }

      return res
        .status(200)
        .json(
          safeCounselor(counselor)
        );
    } catch (error) {
      console.log(
        "getCounselorById error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch counselor",
      });
    }
  };


// ============================================================
// UPDATE AVAILABILITY
// ============================================================

export const updateCounselorAvailability =
  async (req, res) => {
    try {
      const { available } = req.body;

      if (
        typeof available !==
        "boolean"
      ) {
        return res.status(400).json({
          message:
            "available must be true or false",
        });
      }

      const counselor =
        await Counselor.findByIdAndUpdate(
          req.params.id,
          {
            available,

            availability: available
              ? "Available Today"
              : "Busy",
          },
          {
            new: true,
            runValidators: true,
          }
        ).select("-password");

      if (!counselor) {
        return res.status(404).json({
          message:
            "Counselor not found",
        });
      }

      return res.status(200).json({
        message:
          "Availability updated",

        counselor:
          safeCounselor(counselor),

        user:
          safeCounselor(counselor),
      });
    } catch (error) {
      console.log(
        "Update availability error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update availability",
      });
    }
  };


// ============================================================
// GET ALL PATIENTS
// ============================================================

export const getAllPatients =
  async (req, res) => {
    try {
      const patients =
        await User.find({
          role: "user",
        })
          .select(
            "_id firstName lastName profilePic email"
          )
          .lean();

      const formattedPatients =
        patients.map(
          (patient) => ({
            _id: patient._id,

            firstName:
              patient.firstName,

            lastName:
              patient.lastName,

            profilePic:
              patient.profilePic,

            email: patient.email,
          })
        );

      return res.status(200).json({
        success: true,

        count:
          formattedPatients.length,

        patients:
          formattedPatients,
      });
    } catch (error) {
      console.error(
        "Get patients error:",
        error
      );

      return res.status(500).json({
        error: "Server error",
      });
    }
  };


// ============================================================
// GET PATIENT BY ID
// ============================================================

export const getPatientById =
  async (req, res) => {
    try {
      const {
        patientId,
      } = req.params;

      if (!patientId) {
        return res.status(400).json({
          error:
            "Patient ID is required",
        });
      }

      const patient =
        await User.findById(
          patientId
        );

      if (!patient) {
        return res.status(404).json({
          error:
            "Patient not found",
        });
      }

      return res.status(200).json({
        success: true,

        patient,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Server error",
      });
    }
  };


// ============================================================
// DELETE PATIENT
// ============================================================

export const deletePatient =
  async (req, res) => {
    try {
      const {
        patientId,
      } = req.params;

      if (!patientId) {
        return res.status(400).json({
          error:
            "Patient ID is required",
        });
      }

      const patient =
        await User.findById(
          patientId
        );

      if (!patient) {
        return res.status(404).json({
          error:
            "Patient not found",
        });
      }

      if (
        patient.role !== "user"
      ) {
        return res.status(403).json({
          error:
            "This account cannot be deleted from this endpoint",
        });
      }

      await User.findByIdAndDelete(
        patientId
      );

      return res.status(200).json({
        success: true,

        message:
          "Patient deleted successfully",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Server error",
      });
    }
  };