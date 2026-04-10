// API Configuration
// Gets the backend URL from environment variable or uses relative path

export const getApiBaseUrl = (): string => {
  // In production (Netlify), use the environment variable
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      return apiUrl.replace(/\/$/, ''); // Remove trailing slash
    }
  }
  
  // In development, use relative path (same origin)
  return '';
};

/**
 * Make an API request with proper base URL handling
 * Works on localhost, Netlify (with proxy), and with separate backend
 */
export async function apiCall(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + endpoint;
  
  const options: RequestInit = {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  };

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  return response;
}
