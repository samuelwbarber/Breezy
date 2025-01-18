import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';

/*export default function TabLayout(){
    return(
        <Tabs 
        screenOptions={{
                tabBarActiveTintColor: '#ffd33d',
                headerStyle: {
                backgroundColor: '#25292e',
                },
                headerShadowVisible: true,
                headerTintColor: '#fff',
                tabBarStyle: {
                backgroundColor: '#25292e',
                },
        }}
        > 

        </Tabs>
    )
}*/

import { Stack } from "expo-router";

export default function RecordingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="stats" />
      <Stack.Screen name="map" />
    </Stack>
  );
}