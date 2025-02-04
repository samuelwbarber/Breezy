import { Stack } from "expo-router";
import { UserProvider } from "./context/userContext";
import { useUser } from "./context/userContext";
import React, { useEffect } from "react";

export default function RootLayout() {
  return (
    <UserProvider>
      <RootContent />
    </UserProvider>
  );
}

function RootContent() {
  const { currentUser } = useUser(); 

  useEffect(() => {
    if (currentUser) {
      console.log("User logged in:", currentUser);
    } else {
      console.log("User logged out");
    }
  }, [currentUser]); // This runs every time currentUser changes

  return (
    <Stack>
      {currentUser == null ? (
        <Stack.Screen name="index" options={{ headerShown: true}} />
      ) : (
        <Stack.Screen name="(tabs)/home" options={{ headerShown: true }} />
        
      )}
      <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
    </Stack>
  );
}
