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

// Mock user database (all test users use samyak@acpce.ac.in for simplicity)
const mockUsers = {
  "22-1234-5678-9012": { name: "Dr. Rajesh Kumar", email: "samyak@acpce.ac.in", role: "doctor" },
  "22-1111-2222-3333": { name: "Priya Sharma", email: "samyak@acpce.ac.in", role: "patient" },
  "22-4444-5555-6666": { name: "Amit Patel", email: "samyak@acpce.ac.in", role: "patient" },
  "22-8888-9999-0000": { name: "HealthPlus Pharmacy", email: "samyak@acpce.ac.in", role: "pharmacy" },
};

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
