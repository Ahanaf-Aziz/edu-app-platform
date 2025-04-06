
import { toast } from "sonner";

// Base URL for the backend API
// In production, this would be your actual backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-backend-api.com";

/**
 * Makes a request to the Gemini AI through our secure backend
 * @param prompt The user prompt to send to Gemini
 * @param mode The mode of operation (chat, generate, analyze)
 * @param systemPrompt Optional system prompt for context
 */
export const askGeminiSecure = async (
  prompt: string,
  mode: "chat" | "generate" | "analyze" = "chat",
  systemPrompt?: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gemini`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        mode,
        systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to get response from Gemini AI");
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error calling secure Gemini API:", error);
    return "I'm having trouble connecting to my AI services. Please try again later.";
  }
};

/**
 * Authenticates with Google for Classroom access
 * Redirects to Google OAuth flow
 */
export const initiateGoogleAuth = () => {
  // Redirect to backend OAuth endpoint
  window.location.href = `${API_BASE_URL}/api/auth/google`;
};

/**
 * Fetch courses from Google Classroom via our secure backend
 * @param token Access token (optional if using session cookies on backend)
 */
export const fetchClassroomCourses = async (token?: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classroom/courses`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch classroom courses");
    }

    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error("Error fetching classroom courses:", error);
    toast.error("Failed to fetch courses from Google Classroom");
    return [];
  }
};
