import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Modal } from "react-native";

export default function SignInPopup() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignIn = () => {
    if (email === "user@example.com" && password === "password123") {
      setMessage("Login successful!");
      setModalVisible(false);
    } else {
      setMessage("Invalid email or password.");
    }
  };

  const handleSignUp = () => {
    if (email && password) {
      setMessage("Account created successfully!");
      setIsSignUp(false);  // Switch back to login mode after sign-up
    } else {
      setMessage("Please enter valid details.");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Sign In" onPress={() => setModalVisible(true)} />
      
      <Modal 
        visible={isModalVisible}  
        transparent={true}        
        animationType="slide"     
        onRequestClose={() => setModalVisible(false)}  
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>
              {isSignUp ? "Create Account" : "Sign In"}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {isSignUp ? (
              <Button title="Create Account" onPress={handleSignUp} />
            ) : (
              <Button title="Login" onPress={handleSignIn} />
            )}

            <Button title="Close" onPress={() => setModalVisible(false)} />
            {message ? <Text style={styles.message}>{message}</Text> : null}

            <Text 
              style={styles.linkText} 
              onPress={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",  
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  message: {
    marginTop: 10,
    color: "red",
  },
  linkText: {
    marginTop: 15,
    color: "blue",
    textDecorationLine: "underline",
  },
});
