import express from "express";
import {sendInvite, acceptInvite, familyMemberReg, familyMemberLogin, getMyFamilyProfile }  from "../controllers/familyController.js";
import {authenticateFamilyMember} from "../middlewares/authenticateFamilyMember.js"

const router = express.Router()

router.post("/invite", sendInvite);
router.get("/accept", acceptInvite);
router.post("/accept", familyMemberReg);
router.post("/login", familyMemberLogin);
router.get("/me", authenticateFamilyMember , getMyFamilyProfile)

export default router;