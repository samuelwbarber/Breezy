import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { startLocationUpdates } from './locationTask';

export default function RootLayout() {
  
  useEffect(() => {
    startLocationUpdates(); 
  }, []);

  return (
    <Stack>
       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
       <Stack.Screen name="+not-found" />
    </Stack>
  );
}
