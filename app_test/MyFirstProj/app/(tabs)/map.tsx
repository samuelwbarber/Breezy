import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Heatmap, LatLng } from "react-native-maps";
import { useUser } from "@/backend/UserContext";

interface HeatmapPoint extends LatLng {
  weight: number;
}

export default function MapScreen() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const { currentUser } = useUser();

  const transformMessageLogToHeatmap = (): HeatmapPoint[] => {
    if (!currentUser || currentUser.messageLog.length === 0) {
      return [{ latitude: 51.5074, longitude: -0.1278, weight: 0.1 }];
    }
    return currentUser.messageLog.map((msg) => ({
      latitude: msg.coordinate.latitude,
      longitude: msg.coordinate.longitude,
      weight: msg.value,
    }));
  };

  useEffect(() => {
    setHeatmapData(transformMessageLogToHeatmap()); // Update heatmap when user changes
  }, [currentUser]); // 👈 This ensures the map updates when the user logs in

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
