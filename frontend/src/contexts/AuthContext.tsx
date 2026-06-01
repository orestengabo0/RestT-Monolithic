"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  emailVerified: boolean;
  role: {
    id: string;
    name: string;
  };
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user profile
  const refreshUser = useCallback(async () => {
    if (!apiClient.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<{ data: User }>("/auth/me", true);
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      apiClient.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{
        data: {
          user: User;
          tokens: {
            accessToken: string;
            refreshToken: string;
          };
        };
      }>("/auth/login", { email, password });

      // Save tokens
      apiClient.saveTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );

      // Set user
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

      await apiClient.post("/auth/register", { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      // Note: Registration doesn't auto-login, user needs to login after
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    apiClient.logout();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      const response = await apiClient.post<{
        data: { message: string };
      }>("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await apiClient.post<{
        data: { message: string };
      }>("/auth/reset-password", { token, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
