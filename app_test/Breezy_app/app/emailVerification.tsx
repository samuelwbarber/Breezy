import React, { useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "./context/userContext";
import { User } from "./context/user";
import { loginUser, signUpUser } from "./api/auth";

// Helper function to always return a string.
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param ?? "";
}

export default function EmailVerificationScreen() {
  // Get all the query parameters.
  const params = useLocalSearchParams();

  // console.log(params);
  const emailStr = getParam(params.email);
  const verificationCodeStr = getParam(params.code); 
  const usernameStr = getParam(params.username);
  const signIn = getParam(params.signIn) == "true";
  const idStr = getParam(params.id);
  // console.log(emailStr, verificationCodeStr, usernameStr, signIn);

  const { currentUser, setCurrentUser } = useUser();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const router = useRouter();

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(-1); // Keep only the last character.
    }
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < code.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isCodeComplete = code.every((char) => char !== "");

  const handleVerify = () => {
    const enteredCode = code.join("");
    // console.log("Verification code entered:", enteredCode);
    // console.log("Verification code from sign in:", verificationCodeStr);
    // For testing: if the entered code is "000000" or it matches the verification code from SignIn
    if (enteredCode === "000000" || enteredCode === verificationCodeStr) {
        if (signIn){
            console.log("Signing In User", idStr, usernameStr);
            if (idStr !== ""){
                const loggedUser = new User(idStr, usernameStr, emailStr);
                setCurrentUser(loggedUser);
            }else{
                const loggedUser = new User("", usernameStr, emailStr);
                setCurrentUser(loggedUser);
            }
        }else {
            console.log("Signing Up User", usernameStr, code);
            signUpUser(emailStr, usernameStr, "test");
            const loggedUser = new User("test", usernameStr, emailStr);
            setCurrentUser(loggedUser);
        }
      router.replace("/(tabs)/home");
    } else {
      console.log("Verification code incorrect");
      setCode(["", "", "", "", "", ""]);  // Clear the code
      alert("Incorrect verification code. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Enter your verification code</Text>
      <View style={styles.inputContainer}>
        {code.map((value, index) => (
          <TextInput
            key={index}
            style={styles.input}
            value={value}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            maxLength={1}
            ref={(ref) => (inputs.current[index] = ref!)}
            keyboardType="number-pad"
            autoCapitalize="none"
            returnKeyType="next"
          />
        ))}
      </View>
      <TouchableOpacity
        style={[styles.verifyButton, !isCodeComplete && styles.disabledButton]}
        disabled={!isCodeComplete}
        onPress={handleVerify}
      >
        <Text style={styles.verifyButtonText}>Verify</Text>
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
    padding: 20,
  },
  instruction: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
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
  verifyButton: {
    marginTop: 30,
    backgroundColor: "#6C757D",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
