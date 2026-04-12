import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Ensure role is included in user data
        if (storedRole && !userData.role) {
          userData.role = storedRole;
        }
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
    }
    setLoading(false);
  }, []);

  // Login function - stores auth data and updates state
  const login = useCallback((userData, authToken, userRole) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    if (userRole) {
      localStorage.setItem("role", userRole);
    }
    setUser(userData);
    setToken(authToken);
  }, []);

  // Logout function - clears all auth data
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setToken(null);
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!token && !!user;
  }, [token, user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}