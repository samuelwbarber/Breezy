import React, { useEffect, useState } from "react";
import { Text,StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Heatmap, LatLng } from "react-native-maps";
import { useUser } from "@/assets/UserContext";
import {User} from "@/assets/user"

const SERVER_IP = "http://172.23.23.156"; //CHANGE THIS DEPENDING ON YOUR DEVICE IP
const SERVER_PORT = "3000";  
const SERVER_URL = `${SERVER_IP}:${SERVER_PORT}`;

interface HeatmapPoint extends LatLng {
  weight: number;
}

export default function MapScreen() {

  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const { currentUser } = useUser();

  useEffect(() => {

    const fetchHeatmapData = async () => {
      if (!currentUser) {
        console.warn("No current user found.");
        setHeatmapData([{ latitude: 51.5074, longitude: -0.1278, weight: 20 }]);
        return;
      }
    
      console.log(`Fetching Map for user: ${currentUser.email}`);
    
      try {
        const response = await fetch(`${SERVER_URL}/user-data/cyclist_001`);
        
        // Log status of the response and response body
        console.log("API Response Status:", response.status);
        const data = await response.json();
        if (!response.ok) {
          console.error("Error fetching heatmap data:", data.error);
          return;
        }
    
        if (Array.isArray(data) && data.length === 0) {
          console.warn("No points found for the user.");
          setHeatmapData([{ latitude: 51.5074, longitude: -0.1278, weight: 20 }]);
          return;
        }
    
        // Parse data
        const formattedData = data.map((point: any) => ({
          latitude: parseFloat(point.latitude),
          longitude: parseFloat(point.longitude),
          weight: parseFloat(point.weight) + 5.0, // Ensure weight is a float, not string
        }));

        console.log("Formatted Heatmap Data");
        setHeatmapData(formattedData); 
        console.log("Set Heatmap Data")
        console.log(heatmapData);
    
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
      }
    };
  
  
    fetchHeatmapData();
  }, [currentUser]);
  


  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}
      >
        {heatmapData.length > 0 ? (
          <Heatmap points={heatmapData} />
        ) : (
          <Text>No heatmap data available</Text>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
