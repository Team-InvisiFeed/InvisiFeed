import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});

const sendOTP = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.SMTP_EMAIL, // Your email
      pass: process.env.SMTP_PASSWORD, // App password
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendOTP;
