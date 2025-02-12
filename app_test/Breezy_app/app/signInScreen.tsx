import React, { useState, useEffect } from "react";
import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useUser } from "./context/userContext";
import { User } from "./context/user";
import { useRouter } from "expo-router";
import { startLocationUpdates } from "./api/locationTask";
import { loginUser } from "./api/auth";


export default function SignInScreen2() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Only used in Sign Up mode
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

  // Dummy function to simulate sending a verification email and verifying it.
  const verifyEmail = async (email: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Verification code for ${email}: ${code}`);
    return code;
    // TODO complete
  };

  const handleSignIn = async () => {
    setMessage(""); // Reset message

    if (!isSignUp) {

      try {
        // Simulate email verification
        // TODO: Verify this email exists in the database
        // If it does, get the login. If not, show an error message.
        
        const userData = await loginUser(email);
        console.log(userData); 
        if (userData === null) {
          setMessage("Account does not exist. Please sign up instead.");
          return;
        } else {
          const code = await verifyEmail(email);
          const route: `/emailVerification?${string}` = `/emailVerification?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&username=${encodeURIComponent(userData.name)}&signIn=${encodeURIComponent(true)}&id=${encodeURIComponent(userData.id)}`;
          router.replace(route);

        }
      } catch (error) {
        console.error("Error during sign in:", error);
        setMessage("Error during email verification.");
      }
    } else {
      // Sign Up Logic
      
      // Check that user already exists
      const userdata = await loginUser(email);
      if (userdata !== null) {
        setMessage("Account already exists. Please log in instead.");
        return;
      }

      if (username.trim() === "") {
        setMessage("Please enter a username.");
        return;
      }

      try {
        const code = await verifyEmail(email);
        console.log("Username Set as", username)
        const route: `/emailVerification?${string}` =
        `/emailVerification?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&username=${encodeURIComponent(username)}&signIn=${encodeURIComponent(false)}&id=${encodeURIComponent("test")}`;
          router.replace(route); 
        
        
      } catch (error) {
        console.error("Error during sign up:", error);
        setMessage("Error during email verification.");
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
      {/* Render the Username field only in Sign Up mode */}
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
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
