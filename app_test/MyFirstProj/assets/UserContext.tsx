import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "./user"; // Import User class

// Define Context Type
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

// Create Context with default values
const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
});

// Provider Component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to access UserContext
export const useUser = () => useContext(UserContext);
