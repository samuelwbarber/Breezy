import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "../config";

// Store global location subscription
let locationSubscription: Location.LocationSubscription | null = null;

export async function startLocationUpdates(email: string) {
  console.log("🛰️ Requesting foreground location updates...");

  if (!email) {
    console.error("❌ Email is required for location updates.");
    return;
  }

  // Step 1: Request Foreground Permissions
  const { granted } = await Location.requestForegroundPermissionsAsync();
  if (!granted) {
    console.error("❌ Foreground location permission not granted.");
    return;
  }

  const LOCATION_URL = `${SERVER_URL}/location-data/${email}`;

  // Step 2: Ensure Only One Active Subscription
  if (locationSubscription) {
    console.log("⚡ Location updates already running.");
    return;
  }

  console.log("🚀 Starting new location tracking session...");
  
  // Step 3: Start watching location
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation, // High accuracy for tracking
      timeInterval: 5000,  // Update every 5 seconds
      distanceInterval: 0,  // Update regardless of movement
    },
    async (location) => {
      console.log("New foreground location:", location.coords.latitude, location.coords.longitude);

      const { latitude, longitude } = location.coords;
      const timestamp = new Date().toISOString().split(".")[0] + "Z";
      const locationData = { latitude, longitude, timestamp };

      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem("currentLocation", JSON.stringify(locationData));
      } catch (e) {
        console.error("❌ Failed to save location:", e);
      }

      // Send to backend
      try {
        const response = await fetch(LOCATION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          // console.log("❌ Server error:", response.status, errorText);
          return;
        }

        console.log("Location successfully sent to server");
      } catch (e) {
        console.error("❌ Failed to send location to server:", e);
      }
    }
  );

  console.log("✅Foreground location tracking started.");
}

// Stop Location Updates
export function stopLocationUpdates() {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
    console.log("Foreground location tracking stopped.");
  }
}

// Get last saved location from AsyncStorage
export async function getCurrentLocation() {
  try {
    const location = await AsyncStorage.getItem("currentLocation");
    return location ? JSON.parse(location) : null;
  } catch (e) {
    console.error("Failed to fetch location:", e);
    return null;
  }
}
