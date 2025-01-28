import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Heatmap, LatLng } from "react-native-maps";
import { User } from "@/backend/user";

// Define HeatmapPoint based on LatLng
interface HeatmapPoint extends LatLng {
  weight: number;
}

// Define the Message structure
class Message {
  coordinate: { latitude: number; longitude: number };
  value: number;
  date: Date;

  constructor(latitude: number, longitude: number, value: number, date: Date) {
    this.coordinate = { latitude, longitude };
    this.value = value;
    this.date = date;
  }
}
// This is a toy example of a User class
let currentUser = new User("1", "Bob", "bob@gmail.com")
currentUser.addMessage(51.5074, -0.1278, 0.8);
currentUser.addMessage(51.5136, -0.1365, 0.6);
currentUser.addMessage(51.5094, -0.1180, 0.7);

export default function MapScreen() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Transform messageLog into heatmap data
  const transformMessageLogToHeatmap = (): HeatmapPoint[] => {
    return currentUser.messageLog.map((msg) => ({
      latitude: msg.coordinate.latitude,
      longitude: msg.coordinate.longitude,
      weight: msg.value, // Using message's value as weight
    }));
  };

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      const heatmapPoints = transformMessageLogToHeatmap();
      setHeatmapData(heatmapPoints);
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
