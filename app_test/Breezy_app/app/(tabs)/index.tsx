import React, { useState, useEffect } from "react";
import { Text, View, TextInput, Button, StyleSheet } from "react-native";
import { useUser } from "../context/userContext";
import { loginUser } from "../api/auth";
import { User } from "../context/user";
import { useRouter } from "expo-router";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { currentUser, setCurrentUser } = useUser();
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("Current user updated:", currentUser);
  }, [currentUser]);

  const handleSignIn = async () => {
    // "cheat" login for testing
    if (email === "bob@bob.com" && password === "password") {
      const testUser = new User("cyclist_001", "John Doe", "john.cyclist@example.com");
      setCurrentUser(testUser);
      setMessage("Logged in as Bob!");
      router.replace("/(tabs)/(tabs)/home");
      return;
    }

    // API Login
    try {
      const loggedUser = await loginUser(email, password);
      if (!loggedUser) {
        setMessage("Invalid email or password.");
        return;
      }

      setCurrentUser(loggedUser);
      console.log("Login successful!");
      router.replace("/(tabs)/(tabs)/home")
    } catch (error) {
      console.error("Login failed:", error);
      setMessage("Error logging in.");
    }
  };

  return (
    <View style={styles.container}>
      {!currentUser ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
          <Button title="Sign In" onPress={handleSignIn} />
          <Text>{message}</Text>
        </>
      ) : (
        <>
          <Text>Welcome, {currentUser.name}!</Text>
          <Button title="Log Out" onPress={() => setCurrentUser(null)} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: "100%",
  },
});
