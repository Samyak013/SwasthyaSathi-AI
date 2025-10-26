import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Helpful runtime logs for debugging Netlify production issues
try {
	// Print the Vite build-time API URL so we can verify the frontend is pointing to the correct backend
	// This will appear in the browser console when the app starts
	// eslint-disable-next-line no-console
	console.log("[APP START] VITE_API_URL:", import.meta.env.VITE_API_URL);
	// eslint-disable-next-line no-console
	console.log("[APP START] location:", window.location.href);

	const root = document.getElementById("root");
	if (!root) {
		// eslint-disable-next-line no-console
		console.error("[APP START] root element not found");
	}

	createRoot(root!).render(<App />);
} catch (err) {
	// eslint-disable-next-line no-console
	console.error("[APP START] render error:", err);
	// Re-throw so tools like Netlify logs and Sentry (if present) capture the failure
	throw err;
}
