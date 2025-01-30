import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { startLocationUpdates } from './locationTask';
import { UserProvider } from './UserContext';

const SERVER_IP = "http://18.134.180.224"; // Replace with your server's IP address
const SERVER_PORT = "3000"; // The port where your server is running
const SERVER_URL = `${SERVER_IP}:${SERVER_PORT}/getData`;


export default function RootLayout() {
  
  useEffect(() => {
    startLocationUpdates(); 
  }, []);

  useEffect(() => {
    async function testDatabaseConnection() {
      try {
        console.log('Checking Database Connection');
        const response = await fetch(SERVER_URL);
        if (response.ok) {
          const data = await response.json();
          console.log('Database response:', data);
        } else {
          console.error('Failed to connect to the database:', response.status);
        }
      } catch (error) {
        console.error('Network request failed:', error);
      }
    }

    testDatabaseConnection();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
      <Stack.Screen name="+not-found" />
    </Stack>
    
  );
}
