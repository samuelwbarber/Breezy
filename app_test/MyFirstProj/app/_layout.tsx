import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { startLocationUpdates } from "./locationTask";
import { UserProvider } from "@/backend/UserContext"; 

export default function RootLayout() {
  useEffect(() => {
    startLocationUpdates();
  }, []);

  return (
    <UserProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </UserProvider>
  );
}