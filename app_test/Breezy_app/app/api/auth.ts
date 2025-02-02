import { SERVER_URL } from "../config";

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${SERVER_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    return await response.json();
  } catch (error) {
    console.error("Login request failed:", error);
    return null;
  }
}
