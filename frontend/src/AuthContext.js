import React, { createContext, useState, useContext, useEffect } from "react";

// Create a context for authentication
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    access_token: localStorage.getItem("access_token") || "",
    username: localStorage.getItem("username") || "",
  });

  useEffect(() => {
    // Sync state with localStorage
    if (authState.access_token) {
      localStorage.setItem("access_token", authState.access_token);
      localStorage.setItem("username", authState.username);
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
    }
  }, [authState]);

  const login = (access_token, username) => {
    setAuthState({
      access_token,
      username,
    });
  };

  const logout = () => {
    setAuthState({
      access_token: "",
      username: "",
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
