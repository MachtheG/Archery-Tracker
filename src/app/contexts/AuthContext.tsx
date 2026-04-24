"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];   // supports multiple roles, e.g. ["archer", "coach"]
  role: string;       // primary role (first in array) — kept for backward compat
  club: string;
  category: string;
};

type StoredUser = User & { password: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, roles: string[], club: string, category: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Simple localStorage user registry
function getUserRegistry(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("archery_users_registry");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserRegistry(users: StoredUser[]) {
  localStorage.setItem("archery_users_registry", JSON.stringify(users));
}

// Admin invite code — simple secret phrase required to register as admin
const ADMIN_INVITE_CODE = "ARCHERYKE-ADMIN-2026";

export function validateAdminCode(code: string): boolean {
  return code.trim().toUpperCase() === ADMIN_INVITE_CODE;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("archery_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.name && parsed.email) {
          // Migrate old single-role to multi-role
          if (!parsed.roles) {
            parsed.roles = [parsed.role || "archer"];
          }
          parsed.role = parsed.roles[0];
          setUser(parsed as User);
        }
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const sessionUser: User = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          roles: [data.user.role],
          role: data.user.role,
          club: data.user.club,
          category: data.user.category,
        };
        setUser(sessionUser);
        localStorage.setItem("archery_user", JSON.stringify(sessionUser));
        localStorage.setItem("archery_token", data.token);
        setLoading(false);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    return false;
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    roles: string[],
    club: string,
    category: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: roles[0] || "archer",
          club,
          category,
        }),
      });
      if (res.ok) {
        setLoading(false);
        return true; // We don't log them in, they need to verify email
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("archery_user");
    localStorage.removeItem("archery_token");
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
