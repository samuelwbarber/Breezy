import { User } from "@/backend/user";
import React, { useState } from "react";
import { Text, View, TextInput, Button, StyleSheet } from "react-native";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  
  const handleSignIn = () => {
    if (email === "bob@bob.com" && password === "password") {
      setMessage("Login successful!");
      let loggedUser = new User("1", "Bob", "bob@bob.com");
      loggedUser.addMessage(51.5074, -0.1278, 0.8);
      loggedUser.addMessage(51.5136, -0.1365, 0.6);
      loggedUser.addMessage(51.5094, -0.1180, 0.7);
      setCurrentUser(loggedUser); 
    } else {
      setMessage("Invalid email or password.");
    }
  };

  return (
    <View style={styles.container}>
      {!currentUser ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
          <Button title="Sign In" onPress={handleSignIn} />
          <Text>{message}</Text>
        </>
      ) : (
        <>
          <Text>Welcome, {currentUser?.name}!</Text>
          <Button
            title="Log Out"
            onPress={() => {
              setCurrentUser(null); // Clear the user on logout
              setMessage("");
            }}
          />
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
