import React, { useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { pairDevice } from "./api/auth";
import { useUser } from "./context/userContext";
import { useRouter } from "expo-router";

export default function PairDeviceScreen() {
  const [deviceId, setDeviceId] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const { currentUser } = useUser();
  const router = useRouter();

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(-1); 
    }
    const newDeviceId = [...deviceId];
    newDeviceId[index] = text;
    setDeviceId(newDeviceId);

    if (text && index < deviceId.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key === "Backspace" && deviceId[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isDeviceIdComplete = deviceId.every((char) => char !== "");

  const handleConnect = async () => {
    if (currentUser) {
      const id = deviceId.join("");
      try {
        const result = await pairDevice(id, currentUser.email);
        if (result.ok) {
          currentUser.id = id;
          console.log("Connected with Device ID:", id);
          router.replace("/(tabs)/home");
        } else {
          console.log("Pairing failed:", result?.json().message);
        }
      } catch (error) {
        console.error("Error during pairing:", error);
      }
    } else {
      console.log("No User Found");
    }
  };

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
            autoCapitalize="none"
            returnKeyType="next"
          />
        ))}
      </View>
      <TouchableOpacity
        style={[styles.connectButton, !isDeviceIdComplete && styles.disabledButton]}
        disabled={!isDeviceIdComplete}
        onPress={handleConnect}
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
    width: 50, 
    height: 50, 
    margin: 8,
    borderWidth: 2, 
    borderColor: "black",
    color: "black",
    fontSize: 24,
    textAlign: "center",
    borderRadius: 5, 
  },
  connectButton: {
    marginTop: 30,
    backgroundColor: "#6C757D", 
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
