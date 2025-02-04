import React, { useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";

export default function PairDeviceScreen() {
  const [deviceId, setDeviceId] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(-1); // Ensure only one character is kept
    }

    const newDeviceId = [...deviceId];
    newDeviceId[index] = text;
    setDeviceId(newDeviceId);

    // Move focus to the next box if there is text entered
    if (text && index < deviceId.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key === "Backspace" && deviceId[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // Determine if all 6 squares are filled
  const isDeviceIdComplete = deviceId.every((char) => char !== "");

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Enter your device ID</Text>
      <View style={styles.inputContainer}>
        {deviceId.map((value, index) => (
          <TextInput
            key={index}
            style={styles.input}
            value={value}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            maxLength={1}
            ref={(ref) => (inputs.current[index] = ref!)}
            keyboardType="default"
            autoCapitalize="characters"
            returnKeyType="next"
          />
        ))}
      </View>
      <TouchableOpacity
        style={[styles.connectButton, !isDeviceIdComplete && styles.disabledButton]}
        disabled={!isDeviceIdComplete}
        onPress={() => {
          // For now, no functionality.
          console.log("Connect pressed with Device ID:", deviceId.join(""));
        }}
      >
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  instruction: {
    fontSize: 24,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    width: 50, // Smaller size
    height: 50, // Smaller size
    margin: 8,
    borderWidth: 2, // Outline only
    borderColor: "black",
    color: "black",
    fontSize: 24,
    textAlign: "center",
    borderRadius: 5, // Slightly rounded edges
  },
  connectButton: {
    marginTop: 30,
    backgroundColor: "#6C757D", // Cooler gray color
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
