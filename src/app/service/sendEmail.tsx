import nodemailer from "nodemailer";

import { privateEnv } from "@/lib/env/private";

// Create a transport for sending emails (replace with your email service's data)
export async function sendMail(
  subject: string,
  toEmail: string,
  otpText: string,
) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email service
    auth: {
      user: privateEnv.EMAIL_ACCOUNT, // Your email address
      pass: privateEnv.EMAIL_PASSWORD, // Your password
    },
  });
  // Set email options
  const mailOptions = {
    from: privateEnv.EMAIL_ACCOUNT, // Sender
    to: toEmail, // Recipient
    subject: subject, // Email subject
    html: otpText, // Email HTML content
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email sending failed:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
