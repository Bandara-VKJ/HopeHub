import crypto from "crypto";
import FamilyMember from "../models/FamilyMember.js";
import User from "../models/User.js";
import sendInviteEmail from "../utils/sendInviteEmail.js";

const sendInvite = async (req, res) =>{
    try {
        const { userId, name, email, phone } = req.body
        if (!userId || !name || !email || !phone)
        {
            return res.status(400).json({error : 'Missing required fields '})
        }

       const inviter = await User.findById(userId);
       
       if(!inviter) return res.status(404).json({error: 'User not found'})

         let familyMember = await FamilyMember.findOne({ ownerId: userId, email });

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expires = Date.now() + 1000 * 60 * 60 * 24 * 3;

        if (familyMember) {
        familyMember.inviteToken = hashedToken;
        familyMember.inviteTokenExpires = expires;
        familyMember.status = "invited";
        familyMember.name = name;
        familyMember.phone = phone;
        await familyMember.save();
        } else {
        familyMember = await FamilyMember.create({
            ownerId: userId,
            name,
            email,
            phone,
            inviteToken: hashedToken,
            inviteTokenExpires: expires,
        });
    }

    const link = `${process.env.APP_WEB_URL}/family/accept?token=${rawToken}&id=${familyMember._id}`;

    await sendInviteEmail({
      to: email,
      familyMemberName: name,
      inviterName: inviter.firstName || "Your family member",
      link,
    });

    res.json({ success: true, message: "Invite sent" });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Failed to send invite" });
  }
};

export default sendInvite;