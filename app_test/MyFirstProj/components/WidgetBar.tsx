import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";

export default function WidgetBar({ isMapView = false }) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => alert("Paused")}>
        <Text style={styles.buttonText}>Pause</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => alert("Stopped")}>
        <Text style={styles.buttonText}>Stop</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => alert(isMapView ? "Go to Stats" : "Go to Map")}>
        <Text style={styles.buttonText}>{isMapView ? "Stats" : "Map"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 10,
    backgroundColor: "#25292e",
  },
  button: { padding: 10, backgroundColor: "#ffd33d", borderRadius: 10 },
  buttonText: { color: "#25292e", fontWeight: "bold" },
});
