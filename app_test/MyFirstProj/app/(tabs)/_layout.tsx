import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#ffd33d',
            headerStyle: {
            backgroundColor: '#25292e',
            borderBottomWidth: 0
            },
            headerShadowVisible: true,
            headerTintColor: '#fff', //'#02e'
            tabBarStyle: {
            backgroundColor: '#25292e',
            borderTopWidth: 0
            },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
      name = "journey"
      options ={{
        title: 'Statistics',
        tabBarIcon: ({color, focused}) => (
          <Ionicons name={focused ? 'stats-chart': 'stats-chart-outline'} color={color} size={24}/>
        ),
        //tabBarStyle: { display: 'none' }, // Hides the bottom tab bar when we go to journey
      }}
      />
      <Tabs.Screen
        name="mqtt"
        options={{
          title: 'MQTT',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'scan-circle' : 'scan-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
