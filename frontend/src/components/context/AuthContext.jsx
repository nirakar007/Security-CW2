// Manages user auth state, role, etc.
import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../../api/apiClient"; // We need our axios instance

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
  
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check auth status

  // This function will be called on app load to check for an existing session
  const checkAuthStatus = async () => {
    try {
      // We need an endpoint to verify the token from the cookie
      const response = await apiClient.get("/auth/me");
      setUser(response.data); // The endpoint will return user data
    } catch (error) {
      setUser(null); // No valid session
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout"); // Call the backend endpoint
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // This runs regardless of whether the API call succeeded or failed
      setUser(null);
    }
  };

  const value = { user, isLoading, login, logout };

  // We don't render the app until we know if the user is logged in or not
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
