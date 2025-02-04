import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_KEY } from '../assets/keys';
import React, { useState, useEffect } from "react";

//WATCH OUT!

const SERVER_IP = "http://172.23.23.156"; //CHANGE THIS DEPENDING ON YOUR CURRENT IP ADDRESS
const SERVER_PORT = "3000";  
const SERVER_URL = `${SERVER_IP}:${SERVER_PORT}/location`;

let locationSubscription: Location.LocationSubscription | null = null;

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
      timeInterval: 0.1, // Update every 5 seconds
      distanceInterval: 0.001, // Update every 5 meters
    },
    async (location) => {
      const { latitude, longitude } = location.coords;
      const timestamp = new Date().toISOString().split('.')[0] + 'Z';
      const locationData = {latitude, longitude, timestamp};

      //console.log("New foreground location:", latitude, longitude, "at", timestamp);

      // Save location to AsyncStorage
      try {
        //console.log("Sending request:", JSON.stringify(locationData));
        await AsyncStorage.setItem(
          "currentLocation",
          JSON.stringify(locationData)
        );
      } catch (e) {
        console.error("Failed to save location:", e);
      }

       // Send to backend
       try { 
        const response = await fetch (SERVER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData),
        });


        if (!response.ok) {
          const errorText = await response.text(); 
          console.error("Server error:", response.status, errorText);
          throw new Error(`Server responded with status ${response.status}`);
        }

        console.log('Location successfully sent to server');
      } catch (e) {
        console.error('Failed to send location to server:', e);
      }


    }
  );

  console.log("Foreground location tracking started.");
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
