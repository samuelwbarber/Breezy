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

export async function pairDevice(deviceId: string, email: string){
  try {
    const response = await fetch(`${SERVER_URL}/pair-device`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({deviceId, email}),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    return await response.json();
  } catch (error) {
    console.error("Pairing request failed:", error);
    return null;
  }
}

export async function fetchUserData(email: string) {
  try {
    const response = await fetch(`${SERVER_URL}/user-data/${email}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetching user data failed:", error);
    return null;
  }
}

