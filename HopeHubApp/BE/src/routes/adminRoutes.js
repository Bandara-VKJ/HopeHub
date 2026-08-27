import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
} from "../controllers/adminController.js";
import { protectAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/admin-register", registerAdmin);
router.post("/admin-login", loginAdmin);
router.get("/admin", protectAdmin, getAdminProfile);

export default router;