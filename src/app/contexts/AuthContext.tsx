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
    await new Promise(r => setTimeout(r, 400));

    const registry = getUserRegistry();
    const found = registry.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (found) {
      // Migrate old users without roles array
      if (!found.roles) {
        found.roles = [found.role || "archer"];
      }
      const sessionUser: User = {
        id: found.id,
        name: found.name,
        email: found.email,
        roles: found.roles,
        role: found.roles[0],
        club: found.club,
        category: found.category,
      };
      setUser(sessionUser);
      localStorage.setItem("archery_user", JSON.stringify(sessionUser));
      setLoading(false);
      return true;
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
    await new Promise(r => setTimeout(r, 400));

    const registry = getUserRegistry();

    if (registry.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setLoading(false);
      return false;
    }

    // Ensure at least one role
    if (roles.length === 0) roles = ["archer"];

    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      roles,
      role: roles[0],
      club,
      category,
    };

    registry.push(newUser);
    saveUserRegistry(registry);

    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles,
      role: newUser.roles[0],
      club: newUser.club,
      category: newUser.category,
    };
    setUser(sessionUser);
    localStorage.setItem("archery_user", JSON.stringify(sessionUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("archery_user");
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
