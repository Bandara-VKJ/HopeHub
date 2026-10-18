import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protectAdmin = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(503).json({ message: "Admin authentication is not configured" });
  }
  const authHeader = req.headers.authorization;
  const match = typeof authHeader === "string" ? authHeader.match(/^Bearer\s+(\S+)\s*$/i) : null;
  if (!match) return res.status(401).json({ message: "Not authorized, no token" });

  let decoded;
  try {
    decoded = jwt.verify(match[1], secret, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
  if (!decoded || typeof decoded !== "object" || decoded.role !== "admin") {
    return res.status(403).json({ message: "Not authorized as admin" });
  }
  if (typeof decoded.id !== "string" || !/^[a-f\d]{24}$/i.test(decoded.id)) {
    return res.status(401).json({ message: "Not authorized, invalid account" });
  }

  let admin;
  try {
    admin = await Admin.findById(decoded.id).select("_id email role isActive");
  } catch (error) {
    console.error("Admin authentication database failure:", error.name);
    return res.status(503).json({ message: "Admin authentication is temporarily unavailable" });
  }
  if (!admin || admin.isActive !== true || admin.role !== "admin") {
    return res.status(403).json({ message: "An active administrator account is required" });
  }
  // Compatible with the supplied getAdminProfile controller.
  req.admin = { id: String(admin._id), email: admin.email, role: admin.role };
  return next();
};
