import crypto from "crypto";
import FamilyMember from "../models/FamilyMember.js";
import User from "../models/User.js";
import sendInviteEmail from "../utils/sendInviteEmail.js";
import bcrypt from "bcrypt" 
import jwt from "jsonwebtoken";
import { error } from "console";

export const sendInvite = async (req, res) =>{
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

    const link = `${process.env.APP_WEB_URL}/api/family/accept?token=${rawToken}&id=${familyMember._id}`;

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

export const acceptInvite = async (req, res) =>{
  try {
    const {token, id } = req.query

    const hashedToken = crypto.createHash("sha256").update(token || "").digest("hex");

    const familyMember = await FamilyMember.findOne({
      _id :id,
      inviteToken : hashedToken,
      inviteTokenExpires : {$gt : Date.now()}
    });

    if(!familyMember)
    {
      return res.send(`<h2>This invite link is invalid or has expired.</h2>`)
    }

     res.send(`
      <html>
        <body style="font-family: sans-serif; padding: 24px;">
          <h2>Welcome, ${familyMember.name}</h2>
          <p>You've been invited to view accountability updates on HopeHub.</p>
          <form method="POST" action="/api/family/accept">
            <input type="hidden" name="id" value="${id}" />
            <input type="hidden" name="token" value="${token}" />
            <label>Set a password:</label><br/>
            <input type="password" name="password" required /><br/><br/>
            <button type="submit">Accept & Continue</button>
          </form>
        </body>
      </html>
  `);
  } catch (err) {
    console.error("Invite accept error :", err);
    res.status(500).json({ error: "Failed to accept invite" });
  }
}

export const familyMemberReg = async (req, res) => {
  try {
    const {id, token, password } = req.body

    const hashedToken = crypto.createHash("sha256").update(token || '').digest("hex")

    const familyMember = await FamilyMember.findOne({
      _id : id,
      inviteToken : hashedToken,
      inviteTokenExpires : {$gt : Date.now()} 
    })

    if(!familyMember)
    {
      return res.send(`<h2>This invite link is invalid or has expired.</h2>`)
    }
    
    familyMember.passwordHash = await bcrypt.hash(password, 10)
    familyMember.status = "active",
    familyMember.inviteToken = undefined;
    familyMember.inviteTokenExpires = undefined;
    await familyMember.save();

    res.send (`<h2>You're all set, ${familyMember.name}!</h2><p>You can close this page.</p>`)
  } catch (err) {
    console.error("Password set error :", err);
    res.status(500).json({ error: "Failed to set password" });
  }
}
export const familyMemberLogin = async (req, res) => {
  try {
    const {email, password } = req.body

    if (!email || !password )
    {
      return res.status(400).json({error : "Email and password are required."});
    }
    const familyMember = await FamilyMember.findOne({email, status : 'active'});
    
    if(!familyMember || !familyMember.passwordHash)
    {
      return res.status(401).json({error : 'Invalid email or password'})
    }

    const isMatch  = await bcrypt.compare( password, familyMember.passwordHash )

    if(!isMatch)
    {
       return res.status(401).json({error : 'Invalid email or password'})
    }

    const  token  = jwt.sign({
      familyMemberId : familyMember._id,
      ownerId : familyMember.ownerId,
      role : 'family_member'
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d"}
  );

  res.json({ success: true, token, name: familyMember.name, ownerId: familyMember.ownerId });

  } catch (error) {
     console.error("Family login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
} 

export const getMyFamilyProfile = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findById(req.familyMember.familyMemberId).select("-passwordHash -inviteToken");
    res.json({ familyMember });
  } catch (error) {
    res.status(500).json({ error: "Failed to load profile" });
  }
};
