import { Text, View, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import SignInPopup from "@/components/SignInPopUp";


export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
      
      {/* Sign-In Button */}
      <SignInPopup />

      {/* Existing Navigation Link */}
      <Button
        title="Go to Your Map"
        onPress={() => {
          console.log("Navigating to map...");
        }}
        color="#841584"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222", // Fix hex color to a valid format
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#000",
    fontSize: 24,
    marginBottom: 20,
  },
});

  

