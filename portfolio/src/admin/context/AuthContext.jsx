import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing session via httpOnly cookie on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.admin) {
            setAdmin(json.data.admin);
          }
        }
      } catch (err) {
        console.debug("[Auth] Session check failed", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email, password, totpCode) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, totpCode }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json.error || "Authentication failed";
        setError(msg);
        return { success: false, error: msg };
      }

      if (json.require2FA) {
        return { success: false, require2FA: true, message: json.message };
      }

      setAdmin(json.data.admin);
      return { success: true };
    } catch (err) {
      const msg = "Unable to reach authentication server";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
