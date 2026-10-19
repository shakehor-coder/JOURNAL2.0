import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("top_journal_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("top_journal_token") || null);
  const [darkMode, setDarkMode] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Official TOP Journal is clean light theme by default
    document.documentElement.classList.remove("dark");
    localStorage.setItem("top_journal_theme", "light");
  }, []);

  useEffect(() => {
    // Initialize Socket.io connection to backend
    const s = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10
    });
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("top_journal_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("top_journal_theme", "light");
    }
  }, [darkMode]);

  const loginWithCredentials = async (username, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("top_journal_user", JSON.stringify(data.user));
        localStorage.setItem("top_journal_token", data.token);
        return { success: true };
      }
      return { success: false, error: data.error || "Ошибка входа" };
    } catch (err) {
      return { success: false, error: "Не удалось подключиться к серверу" };
    }
  };

  const loginWithToken = async (customToken) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: customToken })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("top_journal_user", JSON.stringify(data.user));
        localStorage.setItem("top_journal_token", data.token);
        return { success: true };
      }
      return { success: false, error: "Неверный токен" };
    } catch (err) {
      return { success: false, error: "Ошибка сети" };
    }
  };

  const loginAsDemo = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemo: true })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("top_journal_user", JSON.stringify(data.user));
        localStorage.setItem("top_journal_token", data.token);
        return { success: true };
      }
      return { success: false, error: "Ошибка демо-входа" };
    } catch (e) {
      return { success: false, error: "Ошибка сети" };
    }
  };

  const loginWithCustomProfile = async (profileData) => {
    try {
      const res = await fetch("/api/auth/set-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("top_journal_user", JSON.stringify(data.user));
        localStorage.setItem("top_journal_token", data.token);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Не удалось применить профиль" };
    } catch (e) {
      return { success: false, error: "Ошибка сети" };
    }
  };

  const approveLoginFromQR = (approvedUser, approvedToken) => {
    setUser(approvedUser);
    setToken(approvedToken);
    localStorage.setItem("top_journal_user", JSON.stringify(approvedUser));
    localStorage.setItem("top_journal_token", approvedToken);
  };

  const updateUserProfile = async (updates) => {
    try {
      const res = await fetch("/api/journal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setUser(data.profile);
        localStorage.setItem("top_journal_user", JSON.stringify(data.profile));
        return { success: true, profile: data.profile };
      }
    } catch (e) {
      console.error("Profile update failed:", e);
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("top_journal_user");
    localStorage.removeItem("top_journal_token");
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isAuthenticated: !!user,
        darkMode,
        toggleDarkMode,
        socket,
        loginWithCredentials,
        loginWithToken,
        loginWithCustomProfile,
        loginAsDemo,
        approveLoginFromQR,
        updateUserProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
