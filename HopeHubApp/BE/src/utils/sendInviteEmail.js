import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendInviteEmail ({ to, familyMemberName, inviterName, link }){
   await transporter.sendMail({
    from : `"HopeHub" <${process.env.SMTP_USER}>`,
    to ,
    subject : `${inviterName} invited you to HopeHub`,
    html : `<p>Hi ${familyMemberName || "there"},</p>
            <p><strong>${inviterName}</strong> has invited you to be their accountability partner on HopeHub.
            You'll be able to view their daily tasks and confirm when they're completed.</p>
            <p><a href="${link}">Accept invite</a></p>
            <p>This link expires in 3 days.</p>`

   }) 
}
export default sendInviteEmail;