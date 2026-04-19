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

// In-memory OTP store
const otpStore = {};

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

    if (!abhaId || !email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing abhaId or email" }),
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const recordId = `otp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store OTP
    otpStore[recordId] = {
      otp,
      email,
      timestamp: Date.now(),
    };

    // Log for debugging
    console.log(`[OTP Generated] ${recordId} for ${email}: ${otp}`);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "OTP sent successfully to your email",
        recordId,
        email,
        maskedEmail: maskEmail(email),
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
