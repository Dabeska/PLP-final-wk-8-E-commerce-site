import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { AuthApi } from '../services/api';
import type { Role, User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role?: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(!!localStorage.getItem('token'));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await AuthApi.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch current user', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [token, logout]);

  const handleAuthSuccess = useCallback((receivedToken: string, receivedUser: User) => {
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token: authToken, user: authUser } = await AuthApi.login(email, password);
      handleAuthSuccess(authToken, authUser);
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { token: authToken, user: authUser } = await AuthApi.register(fullName, email, password);
      handleAuthSuccess(authToken, authUser);
    },
    [handleAuthSuccess]
  );

  const hasRole = useCallback(
    (role?: Role) => {
      if (!role) return !!user;
      return user?.role === role;
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, hasRole }),
    [user, token, loading, login, register, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
