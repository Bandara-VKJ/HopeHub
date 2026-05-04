const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/authController");
const { LoginUser } = require("../controllers/authController")

// route → controller
router.post("/register", registerUser);
router.post("/login", LoginUser);

module.exports = router;