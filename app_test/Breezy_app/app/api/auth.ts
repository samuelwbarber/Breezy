import { SERVER_URL } from "../config";

export async function loginUser(email: string) {
  try {
    console.log("Logging in with email:", email);
    const response = await fetch(`${SERVER_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({email}),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    return await response.json();
  } catch (error) {
    // console.error("Login request failed:", error);
    return null;
  }
}
export async function signUpUser(email: string, username: string, id: string) {
  try {
    console.log("Signing Up:", email, username, id);
    const response = await fetch(`${SERVER_URL}/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({email, username, id}),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

  } catch (error) {
    console.error("Sign up request failed:", error);
    return null;
  }
}