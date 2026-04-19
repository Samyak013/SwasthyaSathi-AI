import { Handler } from "@netlify/functions";

const RENDER_BACKEND_URL = "https://swasthyasathi-ai.onrender.com";

export const handler: Handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/api", "");
  const method = event.httpMethod || "GET";
  const headers = event.headers;
  const body = event.body;

  console.log(`[API Proxy] ${method} ${path}`);

  try {
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const response = await fetch(`${RENDER_BACKEND_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(
          Object.entries(headers)
            .filter(([key]) => !["host", "connection"].includes(key.toLowerCase()))
            .map(([key, value]) => [key, value])
        ),
      },
      body: body && method !== "GET" ? body : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: responseBody,
    };
  } catch (error: any) {
    console.error(`[API Proxy Error] ${method} ${path}:`, error.message);

    // If it's a timeout or network error
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return {
        statusCode: 504,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Backend Service Unavailable",
          message: "The Render backend is not responding. Check Render dashboard.",
          details: `https://dashboard.render.com - Verify service status and check logs`,
        }),
      };
    }

    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Bad Gateway",
        message: error.message,
      }),
    };
  }
};
