import React, { createContext, useContext, useState } from "react";
import { users } from "../data/mockData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [dynamicUsers, setDynamicUsers] = useState([]);

  const login = (email, password) => {
    const allUsers = [...users, ...dynamicUsers];
    const user = allUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true, role: user.role };
    }
    return { success: false };
  };

  const logout = () => setCurrentUser(null);

  const addUser = (newUser) => {
    setDynamicUsers(prev => [...prev, newUser]);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, addUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}