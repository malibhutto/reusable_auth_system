import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.EMAIL_PORT || "2525", 10),
  secure:
    process.env.EMAIL_SECURE === "true" || process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

// Verify connection configuration on startup
if (
  process.env.NODE_ENV !== "test" &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
) {
  transporter.verify((error, success) => {
    if (error) {
      console.warn(
        "⚠️ SMTP Transporter Connection Error. Emails might not be sent. Check your EMAIL credentials in .env",
      );
    } else {
      console.log(
        "📧 SMTP Transporter connected successfully and ready to deliver messages.",
      );
    }
  });
}

export default transporter;
