import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "../config";

let locationSubscription: Location.LocationSubscription | null = null;

export async function startLocationUpdates(id: string) {
  console.log("🛰️ Requesting foreground location updates...");

  if (!id) {
    console.error("❌ id is required for location updates.");
    return;
  }

  const { granted } = await Location.requestForegroundPermissionsAsync();
  if (!granted) {
    console.error("❌ Foreground location permission not granted.");
    return;
  }

  const LOCATION_URL = `${SERVER_URL}/location-data/${id}`;

  if (locationSubscription) {
    console.log("⚡ Location updates already running.");
    return;
  }

  console.log("🚀 Starting new location tracking session...");
  
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation, 
      timeInterval: 6000,  
      distanceInterval: 0,  
    },
    async (location) => {
      console.log("New foreground location:", location.coords.latitude, location.coords.longitude);

      const { latitude, longitude } = location.coords;

      const now = new Date();
      now.setSeconds(0, 0); 
      now.setMinutes(now.getMinutes()-1);
      const timestamp = now.toISOString().split(".")[0] + "Z"; 

      const locationData = { latitude, longitude, timestamp };

      try {
        await AsyncStorage.setItem("currentLocation", JSON.stringify(locationData));
      } catch (e) {
        console.error("❌ Failed to save location:", e);
      }
      try {
        const response = await fetch(LOCATION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log("❌ Server error:", response.status, errorText);
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

export function stopLocationUpdates() {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
    console.log("Foreground location tracking stopped.");
  }
}

export async function getCurrentLocation() {
  try {
    const location = await AsyncStorage.getItem("currentLocation");
    return location ? JSON.parse(location) : null;
  } catch (e) {
    console.error("Failed to fetch location:", e);
    return null;
  }
}
