import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_KEY } from './keys';
import React, { useState, useEffect } from "react";

//background task to get users location and send to server
//gets initiated when we open the app

const LOCATION_TASK_NAME = 'getCurrentLocation';
const SERVER_IP = "http://18.134.180.224"; 
const SERVER_PORT = "22"; // 
const SERVER_URL = `${SERVER_IP}:${SERVER_PORT}`;


TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;

    if (locations && locations.length > 0) {
      const { latitude, longitude } = locations[0].coords; // Get the most recent location
      const timestamp = new Date().toISOString();
      
      const locationData = { latitude, longitude, timestamp };

      console.log('Current location:', locationData);

      // Save the current location to AsyncStorage
      try {
        await AsyncStorage.setItem('currentLocation', JSON.stringify(locationData));
      } catch (e) {
        console.error('Failed to save current location:', e);
      }

      // Send to Server
      try { 
        const response = await fetch(SERVER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(locationData),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        console.log('Location successfully sent to server');
      } catch (e) {
        console.error('Failed to send location to server:', e);
      }

    }
  }
});

//export async function startLocationUpdates() {
    //const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    //if (foregroundStatus !== 'granted') {
      //console.error('Foreground location permission not granted');
      //return;
    //}
  
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.error('Background location permission not granted');
      return;
    //}
  
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        //distanceInterval: 20, // Trigger every 20 metres
        timeInterval: 15000 // Trigger every 15sec

      });
      console.log('Background location tracking started');
    } else {
      console.log('Background location tracking is already running');
    }
  }
  
  //export async function getCurrentLocation() {
    //try {
      //const locationData = await AsyncStorage.getItem('currentLocation');
      //return locationData ? JSON.parse(locationData) : null;
    //} catch (e) {
      //console.error('Failed to fetch current location:', e);
      //return null;
    //}
  //}
  