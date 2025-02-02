import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useUser } from '../../context/userContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { currentUser, setCurrentUser } = useUser();
  const root = useRouter();

  useEffect(() => {
      if (currentUser) {
        console.log("User logged in:", currentUser);
      } else {
        console.log("User logged out");
      }
    }, [currentUser]); 

  return (
    <View style={styles.container}>
      <Text>Welcome, {currentUser.name}!!</Text> 
      <Button
        title="Log out"
        onPress={() => {
          setCurrentUser(null);  // Log out the user
          root.replace("/(tabs)");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
