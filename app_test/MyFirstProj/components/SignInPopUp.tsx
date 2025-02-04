import { User } from "@/assets/user";
import React, { useState } from "react";
import { Text, View, TextInput, Button, StyleSheet } from "react-native";
import { useUser } from "@/assets/UserContext";
import { useEffect } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { currentUser, setCurrentUser } = useUser();
  const [message, setMessage] = useState("");

  const SERVER_IP = "http://172.23.23.156"; //CHANGE THIS DEPENDING ON YOUR DEVICE IP
  const SERVER_PORT = "3000";  
  const SERVER_URL = `${SERVER_IP}:${SERVER_PORT}/login`;

  
  useEffect(() => {
    if (currentUser) {
      console.log("Current user updated:", currentUser);
    }
  }, [currentUser]); 


  const handleSignIn = async () => {

    setCurrentUser(null);

    // Cheat login method
    if (email === "bob@bob.com" && password === "password") {
      
      setMessage("Login successful!");
      console.log("Login successful!");
      let loggedUser = new User("1", "John Cyclist", "john.cyclist@example.com");
      loggedUser.setPassword('e0e6097a6f8af07daf5fc7244336ba37133713a8fc7345c36d667dfa513fabaa');

      setCurrentUser(loggedUser);  // This should trigger a re-render
      

    } else {
      // Check login through API
      try {
        const response = await fetch(SERVER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        setMessage("Login successful!");
        let loggedUser = new User(data.id, data.name, data.email);
        setCurrentUser(loggedUser);

      } catch (error) {
        setMessage("Invalid email or password.");
        console.error("Login error:", error);
      }
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
