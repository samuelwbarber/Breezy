import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from ".user";  // Import your User class

// Define provider props
interface UserProviderProps {
  children: ReactNode;
}

// Define context type
interface UserContextType {
  user: User | null;
  login: (id: string, name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from AsyncStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("loggedInUser");
        if (storedUser) {
          const parsedData = JSON.parse(storedUser);
          const loadedUser = new User(parsedData.id, parsedData.name, parsedData.email);
          setUser(loadedUser);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  // Save user when logging in
  const login = async (id: string, name: string, email: string, password: string) => {
    const newUser = new User(id, name, email);
    newUser.setPassword(password);

    try {
      await AsyncStorage.setItem("loggedInUser", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem("loggedInUser");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
