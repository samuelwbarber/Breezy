import { SERVER_URL } from "../config";
import { User } from "../context/user";
import { Message } from "../context/message";

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

export async function fetchUserDataForUser(user: User): Promise<User | null> {
  try {
    const response = await fetch(`${SERVER_URL}/user-data/${user.email}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json();

    // Map the returned data to Message instances.
    // Adjust the property names as needed if your backend uses different names.
    const messages = data.map((entry: any) => new Message(
      entry.coordinate.latitude,
      entry.coordinate.longitude,
      entry.eco2,
      entry.tvoc,
      new Date(entry.date) // or entry.date if that's the property name
    ));

    // console.log("Fetched user data:", messages);
    user.messageLog = messages;
    // console.log("Fetched userlog data:", user.messageLog);

    return user;
  } catch (error) {
    console.error("Fetching user data failed:", error);
    return null;
  }
}