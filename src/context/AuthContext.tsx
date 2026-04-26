/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authService, type User } from "@/services/auth.service";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
    referredBy?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      // /users/me uses handlerFactory.getOne → { data: { data: user } }
      const freshUser = res.data.data.data;
      setUser(freshUser);
      localStorage.setItem("user", JSON.stringify(freshUser));
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only hit GET /users/me when we might have a session: with httpOnly cookies the
  // client cannot read them, but a guest has no `user` in localStorage so we skip
  // the probe and avoid a 401 on every public page load. OAuthSuccess and other
  // callers still invoke `refreshUser()` explicitly (no stored user yet, but cookie set).
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("user");
    } catch {
      /* private / disabled storage */
    }
    if (!stored) {
      setLoading(false);
      return;
    }
    void refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { data } = res.data;
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
    referredBy?: string
  ) => {
    // Backend returns 201 { status, message } — no token until email is verified.
    await authService.signup({
      name,
      email,
      password,
      passwordConfirm,
      ...(referredBy ? { referredBy } : {}),
    });
  };

  const logout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
