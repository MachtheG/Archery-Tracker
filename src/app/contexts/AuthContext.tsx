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

type StoredUser = User & { password: string };

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current session from localStorage
    const stored = localStorage.getItem("archery_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.name && parsed.email && parsed.role) {
          setUser(parsed as User);
        }
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    // Small delay to simulate network
    await new Promise(r => setTimeout(r, 400));

    const registry = getUserRegistry();
    const found = registry.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (found) {
      const sessionUser: User = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
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
    role: string,
    club: string,
    category: string
  ): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const registry = getUserRegistry();

    // Check if email already registered
    if (registry.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setLoading(false);
      return false;
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: role || "archer",
      club,
      category,
    };

    registry.push(newUser);
    saveUserRegistry(registry);

    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
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

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
