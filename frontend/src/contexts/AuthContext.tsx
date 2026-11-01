/* eslint-disable */
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getUser, isLoggedIn, logout } from '../lib/auth';
import { usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isMounted: boolean;
  logoutUser: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isMounted: false,
  logoutUser: logout,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const u = getUser();
    setUserState(u);
    setIsAuthenticated(isLoggedIn());
    setIsMounted(true);
  }, [pathname]);

  const logoutUser = () => {
    logout();
    setUserState(null);
    setIsAuthenticated(false);
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    setIsAuthenticated(!!u);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isMounted, logoutUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
