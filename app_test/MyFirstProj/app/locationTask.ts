import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Variable to store the location watcher subscription
let locationSubscription: Location.LocationSubscription | null = null;

// Function to start tracking foreground location
export async function startLocationUpdates() {
  console.log("Requesting foreground location updates...");

  // Request location permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.error("Foreground location permission not granted");
    return;
  }

  // Start watching the user's location in the foreground
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 0.001, // Update every 5 seconds
      distanceInterval: 0.001, // Update every 5 meters
    },
    async (location) => {
      const { latitude, longitude } = location.coords;
      console.log("New foreground location:", latitude, longitude);

      // Save location to AsyncStorage
      try {
        await AsyncStorage.setItem(
          "currentLocation",
          JSON.stringify({ latitude, longitude })
        );
      } catch (e) {
        console.error("Failed to save location:", e);
      }
    }
  );

  console.log("Foreground location tracking started.");
}

// Function to stop tracking foreground location
export function stopLocationUpdates() {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
    console.log("Foreground location tracking stopped.");
  }
}

// Function to get the last stored location
export async function getCurrentLocation() {
  try {
    const location = await AsyncStorage.getItem("currentLocation");
    return location ? JSON.parse(location) : null;
  } catch (e) {
    console.error("Failed to fetch location:", e);
    return null;
  }
}
