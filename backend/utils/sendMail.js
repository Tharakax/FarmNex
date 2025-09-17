import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `Smart Farm Management System <${process.env.EMAIL_USER}>`, // sender mail
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

export default sendMail;