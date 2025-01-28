import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Heatmap, LatLng } from 'react-native-maps';

interface HeatmapPoint extends LatLng {
  weight: number;
}

export default function MapScreen() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to dynamically fetch or generate heatmap data
  const fetchHeatmapData = async (): Promise<HeatmapPoint[]> => {
    // Simulate an API call or data calculation
    const data: HeatmapPoint[] = [
      { latitude: 51.5074, longitude: -0.1278, weight: 0.8 },
      { latitude: 51.5136, longitude: -0.1365, weight: 0.6 },
      { latitude: 51.5094, longitude: -0.1180, weight: 0.7 },
      { latitude: 51.5200, longitude: -0.1400, weight: 0.5 },
    ];
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 2000); // Simulates network delay
    });
  };

  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        const data = await fetchHeatmapData();
        setHeatmapData(data);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHeatmapData();
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
