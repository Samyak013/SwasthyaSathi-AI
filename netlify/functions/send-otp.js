// Import nodemailer for sending emails
const nodemailer = require("nodemailer");

// Helper to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to mask email 
function maskEmail(email) {
  const [name, domain] = email.split("@");
  const masked = name.substring(0, 2) + "*".repeat(Math.max(0, name.length - 2)) + "@" + domain;
  return masked;
}

// Initialize email transporter (reuse connection)
let transporter = null;
function getTransporter() {
  if (!transporter && process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

// Mock user database (all test users use samyak@acpce.ac.in for simplicity)
const mockUsers = {
  "22-1234-5678-9012": { name: "Dr. Rajesh Kumar", email: "samyak@acpce.ac.in", role: "doctor" },
  "22-1111-2222-3333": { name: "Priya Sharma", email: "samyak@acpce.ac.in", role: "patient" },
  "22-4444-5555-6666": { name: "Amit Patel", email: "samyak@acpce.ac.in", role: "patient" },
  "22-8888-9999-0000": { name: "HealthPlus Pharmacy", email: "samyak@acpce.ac.in", role: "pharmacy" },
};

// In-memory OTP store
const otpStore = {};

// Function to send OTP email
async function sendOTPEmail(email, otp, userName) {
  try {
    const mailer = getTransporter();
    if (!mailer) {
      console.warn("❌ Email credentials not configured - OTP will not be sent");
      return false;
    }

    await mailer.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your Swashtya Sathi AI OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 30px;">Swashtya Sathi AI</h2>
          <p style="font-size: 16px; color: #333;">Hello ${userName || "User"},</p>
          <p style="font-size: 14px; color: #666; margin-bottom: 30px;">Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h1 style="color: #dc2626; letter-spacing: 8px; margin: 0; font-size: 36px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666; margin: 20px 0;">
            ⏱️ This OTP is valid for <strong>5 minutes</strong>.
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            🔒 For security: Never share this code with anyone. Swashtya Sathi AI staff will never ask for your OTP.
          </p>
        </div>
      `,
    });

    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { abhaId, email } = JSON.parse(event.body || "{}");

    if (!abhaId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing abhaId parameter" }),
      };
    }

    // Look up user by ABHA ID (matches backend behavior)
    const user = mockUsers[abhaId];
    if (!user) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "User not found with this ABHA ID" }),
      };
    }

    // Use provided email or look up from mock database
    const userEmail = email || user.email;
    if (!userEmail) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Email is required for OTP" }),
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const recordId = `otp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store OTP in memory
    otpStore[recordId] = {
      otp,
      email: userEmail,
      abhaId,
      timestamp: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    console.log(`[OTP Generated] ${recordId} for ${userEmail} (User: ${user.name}): ${otp}`);

    // Send OTP email asynchronously (don't block response)
    sendOTPEmail(userEmail, otp, user.name).catch(err => 
      console.error("Background email send error:", err)
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "OTP sent successfully to your email",
        recordId,
        email: userEmail,
        maskedEmail: maskEmail(userEmail),
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      }),
    };
  } catch (error) {
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
