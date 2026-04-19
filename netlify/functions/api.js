const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const RENDER_BACKEND_URL = "https://swasthyasathi-ai.onrender.com";

exports.handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/api", "");
  const method = event.httpMethod || "GET";
  const headers = event.headers;
  const body = event.body;

  console.log(`[API Proxy] ${method} ${path}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const headerObject = Object.fromEntries(
      Object.entries(headers)
        .filter(([key]) => !["host", "connection"].includes(key.toLowerCase()))
        .map(([key, value]) => [key, value])
    );
    headerObject["Content-Type"] = "application/json";

    const response = await fetch(`${RENDER_BACKEND_URL}${path}`, {
      method,
      headers: headerObject,
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
  } catch (error) {
    console.error(`[API Proxy Error] ${method} ${path}:`, error.message);

    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Backend temporarily unavailable",
          message: "Using local mock data. Note: Production backend on Render requires DATABASE_URL env var.",
          success: false,
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
