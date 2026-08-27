import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const registerAdmin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin with this email already exists" });
    }

    const admin = await Admin.create({ email, password, role });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Register admin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "This admin account is deactivated" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin);

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login admin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ admin });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};