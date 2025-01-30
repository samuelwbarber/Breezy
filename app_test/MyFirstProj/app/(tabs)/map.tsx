import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Heatmap, LatLng } from "react-native-maps";
import { useUser } from "@/app/UserContext";
import {User} from "@/app/user"

const SERVER_IP = "http://192.168.1.66"; //CHANGE THIS DEPENDING ON YOUR DEVICE IP
const SERVER_PORT = "3000";  
const SERVER_URL = `${SERVER_IP}:${SERVER_PORT}`;

interface HeatmapPoint extends LatLng {
  weight: number;
}

export default function MapScreen() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const { currentUser } = useUser();


  useEffect(() => {
    console.log("Current user:", currentUser);
    if (!currentUser) {
      // Set a default location (Example: Central London)
      setHeatmapData([
        { latitude: 51.5074, longitude: -0.1278, weight: 1 } // Default point
      ]);
      return;
    }

    const fetchHeatmapData = async () => {
      try {
        const response = await fetch(
          `${SERVER_URL}/user-data-by-email/${encodeURIComponent(currentUser.email)}`
        );
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        console.log("Heatmap data:", data);
        setHeatmapData(data);
      } catch (error) {
        console.error("Failed to fetch heatmap data:", error);
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
        <Heatmap points={heatmapData} />
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
