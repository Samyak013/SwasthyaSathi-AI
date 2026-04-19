import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

// Simple in-memory OTP store (resets on function restart)
const otpStore: { [key: string]: { otp: string; email: string; timestamp: number } } = {};

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  const masked = name.substring(0, 2) + "*".repeat(Math.max(0, name.length - 2)) + "@" + domain;
  return masked;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { abhaId, email } = JSON.parse(event.body || "{}");

    if (!abhaId || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing abhaId or email" }),
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const recordId = `otp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store OTP in memory
    otpStore[recordId] = {
      otp,
      email,
      timestamp: Date.now(),
    };

    // Send email asynchronously (don't wait)
    transporter
      .sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your Swashtya Sathi AI OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Swashtya Sathi AI</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="color: #dc2626; letter-spacing: 5px; text-align: center;">${otp}</h1>
            <p>This OTP is valid for 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">Do not share this code with anyone.</p>
          </div>
        `,
      })
      .catch((err) => console.error("Email send failed:", err));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "OTP sent successfully to your email",
        recordId,
        email,
        maskedEmail: maskEmail(email),
        otp: process.env.NODE_ENV === "development" ? otp : undefined, // Show OTP in dev mode
      }),
    };
  } catch (error: any) {
    console.error("OTP endpoint error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to send OTP",
        message: error.message,
      }),
    };
  }
};
