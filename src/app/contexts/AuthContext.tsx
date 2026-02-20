"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  club: string;
  category: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: string, club: string, category: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally: load user from localStorage/session
    const stored = localStorage.getItem("archery_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        parsed &&
        typeof parsed.id === "string" &&
        typeof parsed.name === "string" &&
        typeof parsed.email === "string" &&
        (parsed.role === "archer" || parsed.role === "coach" || parsed.role === "admin")
      ) {
        setUser(parsed as User);
      } else {
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // TODO: Replace with real API call
    await new Promise(r => setTimeout(r, 700));
    if (email === "coach@archery.com" && password === "coach") {
      const u: User = {
          id: "2", name: "Coach", email, role: "coach",
          club: "",
          category: ""
      };
      setUser(u);
      localStorage.setItem("archery_user", JSON.stringify(u));
      setLoading(false);
      return true;
    }
    if (email === "archer@archery.com" && password === "archer") {
      const u: User = {
          id: "1", name: "Archer", email, role: "archer",
          club: "",
          category: ""
      };
      setUser(u);
      localStorage.setItem("archery_user", JSON.stringify(u));
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: string, club: string, category: string) => {
    setLoading(true);
    // TODO: Replace with real API call
    await new Promise(r => setTimeout(r, 700));
    const u: User = { id: Date.now().toString(), name, email, role, club, category };
    setUser(u);
    localStorage.setItem("archery_user", JSON.stringify(u));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("archery_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
