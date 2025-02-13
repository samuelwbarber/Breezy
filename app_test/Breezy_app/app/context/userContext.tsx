import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './user';
import { startLocationUpdates, stopLocationUpdates } from '../api/locationTask';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

// Create Context
const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user from AsyncStorage when app starts
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      }
    };
    loadUser();
  }, []);

  // Automatically start/stop location updates when currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log("User logged in, starting location updates...");
      startLocationUpdates(currentUser.id);
    } else {
      console.log("User logged out, stopping location updates...");
      stopLocationUpdates();
    }
  }, [currentUser]);

  // Save user to AsyncStorage when they log in
  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('currentUser');
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to access UserContext
export const useUser = () => useContext(UserContext);
