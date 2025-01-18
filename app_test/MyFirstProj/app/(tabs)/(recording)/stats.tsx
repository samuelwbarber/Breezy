import React from "react";
import { View, Text, StyleSheet } from "react-native";
import WidgetBar from "@/components/WidgetBar";
import Ionicons from '@expo/vector-icons/Ionicons';

//stats.tsx will:
// show statistics and a widget bar
// display mock data (for timer, current particle readings, distance travelled etc.)


export default function Stats() {
  return (
    <View style={styles.container}>
      <Text style={styles.timer}>00:05:23</Text>
      <Text style={styles.reading}>Particle Reading: 35 µg/m³</Text>
      <View style={styles.metrics}>
        <Text style={styles.metricText}>Distance: 1.2 km</Text>
        <Text style={styles.metricText}>Average: 28 µg/m³</Text>
      </View>
      <WidgetBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", padding: 20 },
  timer: { fontSize: 32, fontWeight: "bold", textAlign: "center" },
  reading: { fontSize: 18, textAlign: "center" },
  metrics: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  metricText: { fontSize: 16 },
});
