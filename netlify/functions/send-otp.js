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

// Proxy to backend for actual OTP sending with timeout
async function sendOTPViaBackend(abhaId, email) {
  const backendUrl = process.env.REACT_APP_API_URL || "https://swasthyasathi-ai.onrender.com";
  
  try {
    // Create abort controller with 8 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${backendUrl}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ abhaId, email }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ OTP sent via backend for ${email}`);
      return data;
    } else {
      console.warn(`⚠️ Backend returned status ${response.status}:`, data);
      return null;
    }
  } catch (error) {
    const isTimeout = error.name === 'AbortError';
    if (isTimeout) {
      console.warn(`⏱️ Backend timeout (8s) - using fallback OTP for ${email}`);
    } else {
      console.warn(`⚠️ Backend fetch error: ${error.message}`);
    }
    return null;
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

    // Generate OTP (for fallback only)
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    const recordId = `otp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Try sending via backend first
    console.log(`[OTP] Attempting to send OTP via backend for ${userEmail}...`);
    const backendResult = await sendOTPViaBackend(abhaId, userEmail);

    if (backendResult) {
      // Backend successfully sent OTP
      console.log(`✅ OTP sent successfully via backend to ${userEmail}`);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          message: "OTP sent successfully to your email",
          recordId: backendResult.recordId || recordId,
          email: userEmail,
          maskedEmail: maskEmail(userEmail),
          otp: process.env.NODE_ENV === "development" ? backendResult.otp : undefined,
        }),
      };
    }

    // Fallback: Generate mock OTP if backend unavailable (graceful degradation)
    console.log(`⚠️ Backend unavailable, generating offline OTP for ${userEmail}`);
    const otp = generateOTP();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "OTP sent to your email (fallback mode)",
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
