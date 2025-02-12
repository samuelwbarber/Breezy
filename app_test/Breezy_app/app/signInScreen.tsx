import React, { useState, useEffect } from "react";
import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useUser } from "./context/userContext";
import { loginUser } from "./api/auth";
import { User } from "./context/user";
import { useRouter } from "expo-router";
import { startLocationUpdates } from "./api/locationTask";

export default function SignInScreen2() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Only used in Sign Up mode
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up

  const { currentUser, setCurrentUser } = useUser();
  const router = useRouter();

  // Whenever currentUser updates, redirect automatically if a user is logged in.
  useEffect(() => {
    console.log("Current user updated:", currentUser);
    if (currentUser) {
      router.replace('/pair_device');
    }
  }, [currentUser, router]);

  // A simple password validator: at least 8 characters, one number, one special character.
  const isValidPassword = (pass: string) => {
    const lengthRequirement = pass.length >= 8;
    const numberRequirement = /[0-9]/.test(pass);
    const specialCharRequirement = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return lengthRequirement && numberRequirement && specialCharRequirement;
  };

  const handleSignIn = async () => {
    setMessage(""); // Reset message

    if (!isSignUp) {
      // Sign In Logic
      // "Cheat" login for testing
      if (email === "bob@bob.com" && password === "password") {
        const testUser = new User("cyclist_001", "John Doe", "john.cyclist@example.com");
        setCurrentUser(testUser);
        setMessage("Logged in as Bob!");
        startLocationUpdates(testUser.email);
        router.replace("/pair_device");
        return;
      }

      try {
        const loggedUser = await loginUser(email, password);
        if (!loggedUser) {
          setMessage("Invalid email or password.");
          return;
        }
        setCurrentUser(loggedUser);
        console.log("Login successful!");
        startLocationUpdates(loggedUser.email);
        router.replace("/pair_device");
      } catch (error) {
        console.error("Login failed:", error);
        setMessage("Error logging in.");
      }
    } else {
      // Sign Up Logic

      // For this toy example, if the email is "bob@bob.com", we assume an account already exists.
      if (email === "bob@bob.com") {
        setMessage("Account already exists. Please log in instead.");
        return;
      }

      // Check that the username is provided
      if (username.trim() === "") {
        setMessage("Please enter a username.");
        return;
      }

      // Check that password and confirm password match
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      // Validate password meets requirements
      if (!isValidPassword(password)) {
        setMessage("Password must be at least 8 characters long and include at least one number and one special character.");
        return;
      }

      try {
        // Simulate account creation by instantiating a new user with the provided username.
        const newUser = new User("new_user_001", username, email);
        setCurrentUser(newUser);
        setMessage("Account created and logged in!");
        router.replace("/pair_device");
      } catch (error) {
        console.error("Account creation failed:", error);
        setMessage("Error creating account.");
      }
    }
  };

  // If a user is already logged in, don't render the sign in UI.
  if (currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? "Create Account" : "Sign In"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Conditionally render the Username field for Sign Up */}
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />
      )}
      <Button title={isSignUp ? "Sign Up" : "Sign In"} onPress={handleSignIn} />
      {message !== "" && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setMessage(""); }}>
        <Text style={styles.toggleText}>
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: "100%",
  },
  message: {
    marginTop: 10,
    color: "red",
  },
  toggleText: {
    marginTop: 15,
    color: "blue",
    textDecorationLine: "underline",
  },
});
