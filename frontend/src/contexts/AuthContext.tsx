import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRoleLabel } from "../config/roleLabels";
import type { User } from "../types/domain";
import {
  AuthError,
  loginWithCredentials,
  logoutFromApi,
} from "../services/authService";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "../services/authStorage";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = loadAuthSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginWithCredentials(email, password);
    setUser(result.user);
    setToken(result.token);
    saveAuthSession({ user: result.user, token: result.token });
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutFromApi(token);
      } catch {
        // Déconnexion locale même si l'API échoue
      }
    }
    setUser(null);
    setToken(null);
    clearAuthSession();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export { getRoleLabel, AuthError };
