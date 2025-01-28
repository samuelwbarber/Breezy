import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

//background task to get users location

const LOCATION_TASK_NAME = 'logLocation';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;

    if (locations && locations.length > 0) {
      const currentLocation = locations[0]; // Get the most recent location
      console.log('Current location:', currentLocation);

      // Save the current location to AsyncStorage
      try {
        await AsyncStorage.setItem('currentLocation', JSON.stringify(currentLocation));
      } catch (e) {
        console.error('Failed to save current location:', e);
      }
    }
  }
});

export async function startLocationUpdates() {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.error('Foreground location permission not granted');
      return;
    }
  
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.error('Background location permission not granted');
      return;
    }
  
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 20, // Trigger every 20 metres
      });
      console.log('Background location tracking started');
    } else {
      console.log('Background location tracking is already running');
    }
  }
  
  export async function getCurrentLocation() {
    try {
      const location = await AsyncStorage.getItem('currentLocation');
      return location ? JSON.parse(location) : null;
    } catch (e) {
      console.error('Failed to fetch current location:', e);
      return null;
    }
  }
  