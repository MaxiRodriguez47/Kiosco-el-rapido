import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type UserRole = "cliente" | "admin";

interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "kiosco-el-rapido-auth";

const USERS = [
  { username: "admin", password: "admin123", role: "admin" as UserRole },
  { username: "cliente", password: "cliente123", role: "cliente" as UserRole },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch (error) {
      console.error("Error al cargar sesión:", error);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error al guardar sesión:", error);
    }
  }, [user]);

  const login = (username: string, password: string): boolean => {
    const found = USERS.find((u) => u.username === username && u.password === password);
    if (found) {
      setUser({ username: found.username, role: found.role });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
