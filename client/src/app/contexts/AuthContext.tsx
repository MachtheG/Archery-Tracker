"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiUrl, authHeaders } from "../lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];   // supports multiple roles, e.g. ["archer", "coach"]
  role: string;       // primary role (first in array) — kept for backward compat
  club: string;
  category: string;
  leaderboardPublic: boolean;
  twoFactorEnabled: boolean;
};

export type LoginResult =
  | { status: "ok" }
  | { status: "twoFactorRequired"; pendingToken: string }
  | { status: "emailNotVerified" }
  | { status: "error"; message: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyTwoFactor: (pendingToken: string, code: string) => Promise<boolean>;
  signup: (opts: SignupOptions) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  setLeaderboardPublic: (value: boolean) => Promise<boolean>;
  setTwoFactorEnabled: (value: boolean) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<{ ok: boolean; message: string }>;
};

export type SignupOptions = {
  name: string;
  email: string;
  password: string;
  roles: string[];
  club: string;
  category: string;
  agreeToTerms: boolean;
  leaderboardOptIn: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

type ApiUser = {
  id: string | number;
  name: string;
  email: string;
  role: string;
  club: string;
  category: string;
  leaderboardPublic?: boolean;
  twoFactorEnabled?: boolean;
};

function toSessionUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id.toString(),
    name: apiUser.name,
    email: apiUser.email,
    roles: [apiUser.role],
    role: apiUser.role,
    club: apiUser.club,
    category: apiUser.category,
    leaderboardPublic: apiUser.leaderboardPublic !== false,
    twoFactorEnabled: apiUser.twoFactorEnabled === true,
  };
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
          if (typeof parsed.leaderboardPublic !== "boolean") {
            parsed.leaderboardPublic = true;
          }
          if (typeof parsed.twoFactorEnabled !== "boolean") {
            parsed.twoFactorEnabled = false;
          }
          setUser(parsed as User);
        }
      } catch {
        setUser(null);
      }
    }
  }, []);

  const establishSession = (data: { token: string; user: ApiUser }) => {
    const sessionUser = toSessionUser(data.user);
    setUser(sessionUser);
    localStorage.setItem("archery_user", JSON.stringify(sessionUser));
    localStorage.setItem("archery_token", data.token);
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.twoFactorRequired) {
          setLoading(false);
          return { status: "twoFactorRequired", pendingToken: data.pendingToken };
        }
        establishSession(data);
        setLoading(false);
        return { status: "ok" };
      }

      if (res.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
        setLoading(false);
        return { status: "emailNotVerified" };
      }

      setLoading(false);
      return { status: "error", message: data.message || "Invalid email or password." };
    } catch (err) {
      console.error(err);
      setLoading(false);
      return { status: "error", message: "Could not reach the server. Please try again." };
    }
  };

  const verifyTwoFactor = async (pendingToken: string, code: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/verify-2fa"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, code }),
      });
      if (res.ok) {
        const data = await res.json();
        establishSession(data);
        setLoading(false);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    return false;
  };

  const signup = async (opts: SignupOptions): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: opts.name,
          email: opts.email,
          password: opts.password,
          role: opts.roles[0] || "archer",
          club: opts.club,
          category: opts.category,
          agreeToTerms: opts.agreeToTerms,
          leaderboardOptIn: opts.leaderboardOptIn,
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

  const patchMe = async (body: Record<string, boolean>): Promise<boolean> => {
    const token = localStorage.getItem("archery_token");
    if (!user || !token) return false;
    try {
      const res = await fetch(apiUrl("/api/auth/me"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify(body),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const updated = toSessionUser(data.user);
      setUser(updated);
      localStorage.setItem("archery_user", JSON.stringify(updated));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const setLeaderboardPublic = (value: boolean) => patchMe({ leaderboardPublic: value });
  const setTwoFactorEnabled = (value: boolean) => patchMe({ twoFactorEnabled: value });

  const deleteAccount = async (password: string): Promise<{ ok: boolean; message: string }> => {
    const token = localStorage.getItem("archery_token");
    if (!token) return { ok: false, message: "Not logged in." };
    try {
      const res = await fetch(apiUrl("/api/auth/me"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        logout();
        return { ok: true, message: data.message || "Account deleted." };
      }
      return { ok: false, message: data.message || "Could not delete account." };
    } catch (err) {
      console.error(err);
      return { ok: false, message: "Could not reach the server." };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, verifyTwoFactor, signup, logout, hasRole,
      setLeaderboardPublic, setTwoFactorEnabled, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
