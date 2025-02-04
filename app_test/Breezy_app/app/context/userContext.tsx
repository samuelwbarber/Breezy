import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './user';

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
        setCurrentUser(JSON.parse(storedUser)); // Set the current user if found in AsyncStorage
      }
    };

    loadUser();
  }, []);

  // Save user to AsyncStorage when they log in
  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      AsyncStorage.setItem('currentUser', JSON.stringify(user)); // Save user in AsyncStorage
    } else {
      AsyncStorage.removeItem('currentUser'); // Remove user data when logged out
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
