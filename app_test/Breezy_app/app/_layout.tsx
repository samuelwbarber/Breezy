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
      console.log("User logged in:", currentUser.name);
    } else {
      console.log("User logged out");
    }
  }, [currentUser]); 

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
