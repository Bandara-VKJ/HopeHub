import express from "express";
import {sendInvite, acceptInvite, familyMemberReg }  from "../controllers/familyController.js";

const router = express.Router()

router.post("/invite", sendInvite);
router.get("/accept", acceptInvite);
router.post("/accept", familyMemberReg);

export default router;