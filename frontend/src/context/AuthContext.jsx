import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("prepace_token");
    const storedUser = localStorage.getItem("prepace_user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, ...userData } = response.data.data;
      localStorage.setItem("prepace_token", token);
      localStorage.setItem("prepace_user", JSON.stringify(userData));
      setUser(userData);
      return { success: true, profileComplete: userData.profileComplete };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post("/auth/register", formData);
      const { token, ...userData } = response.data.data;
      localStorage.setItem("prepace_token", token);
      localStorage.setItem("prepace_user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const completeProfile = async (formData) => {
    try {
      const response = await api.post("/auth/complete-profile", formData);
      const { token, ...userData } = response.data.data;
      localStorage.setItem("prepace_token", token);
      localStorage.setItem("prepace_user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile completion failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("prepace_token");
    localStorage.removeItem("prepace_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, completeProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
