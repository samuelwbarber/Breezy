  import React, { useState, useEffect } from "react";
  import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
  import { useUser } from "../context/userContext";
  import { loginUser } from "../api/auth";
  import { User } from "../context/user";
  import { useRouter } from "expo-router";


  export default function SignInScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
  
    const { currentUser, setCurrentUser } = useUser();
    const router = useRouter();
  
    useEffect(() => {
      console.log("Current user updated:", currentUser);
    }, [currentUser]);
  
    // A simple password validator: at least 8 characters, one number, one special character.
    const isValidPassword = (pass) => {
      const lengthRequirement = pass.length >= 8;
      const numberRequirement = /[0-9]/.test(pass);
      const specialCharRequirement = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
      return lengthRequirement && numberRequirement && specialCharRequirement;
    };
  
    const handleSignIn = async () => {
      setMessage(""); // Reset message
  
      // Sign In Logic
      if (!isSignUp) {
        // "Cheat" login for testing
        if (email === "bob@bob.com" && password === "password") {
          const testUser = new User("cyclist_001", "John Doe", "john.cyclist@example.com");
          setCurrentUser(testUser);
          setMessage("Logged in as Bob!");
          router.replace("/(tabs)/(tabs)/home");
          return;
        }
  
        // API Login (expand as needed)
        try {
          const loggedUser = await loginUser(email, password);
          if (!loggedUser) {
            setMessage("Invalid email or password.");
            return;
          }
          setCurrentUser(loggedUser);
          console.log("Login successful!");
          router.replace("/(tabs)/(tabs)/home");
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
  
        // Create a new account. Replace this with your actual account creation logic/API.
        try {
          // Simulate account creation by instantiating a new user.
          const newUser = new User("new_user_001", "New User", email);
          // Optionally, call an API: await createUser(email, password);
          setCurrentUser(newUser);
          setMessage("Account created and logged in!");
          router.replace("/(tabs)/(tabs)/home");
        } catch (error) {
          console.error("Account creation failed:", error);
          setMessage("Error creating account.");
        }
      }
    };
  
    return (
      <View style={styles.container}>
        {!currentUser ? (
          <>
            <Text style={styles.title}>{isSignUp ? "Create Account" : "Sign In"}</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
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