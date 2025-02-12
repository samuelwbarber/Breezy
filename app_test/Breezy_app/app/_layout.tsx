import { Stack } from "expo-router";
import { UserProvider } from "./context/userContext";
import { useUser } from "./context/userContext";
import React, { useEffect } from "react";
import { startLocationUpdates, stopLocationUpdates } from "./api/locationTask";

export default function RootLayout() {
  return (
    <UserProvider>
      <RootContent />
    </UserProvider>
  );
}

function LocationHandler() {
  const { currentUser } = useUser();

  // useEffect(() => {
  //   if (currentUser) {
  //     console.log("App: User logged in, starting location tracking...");
  //     startLocationUpdates(currentUser.email);
  //   } else {
  //     console.log("App: User logged out, stopping location tracking...");
  //     stopLocationUpdates();
  //   }
  // }, [currentUser]);

  return null; // This component only runs effects, it renders nothing
}

function RootContent() {
  const { currentUser } = useUser(); 

  useEffect(() => {
    if (currentUser) {
      console.log("User logged in:", currentUser.name);
    } else {
      console.log("User logged out");
    }
  }, [currentUser]); // This runs every time currentUser changes

  return (
    <Stack>
      {currentUser == null ? (
        <Stack.Screen name="index" options={{ headerShown: false}} />
      ) : (
        <Stack.Screen name="(tabs)/home" options={{ headerShown: false }} />
        
      )}
      <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
      <Stack.Screen name="signInScreen" options={{ headerShown: false}}/>
      <Stack.Screen name="pair_device" options={{ headerShown: false}}/>
    </Stack>
  );
}
