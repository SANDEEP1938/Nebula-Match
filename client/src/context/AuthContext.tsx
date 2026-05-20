import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import api from '../api/client';
import type { ApiSuccess } from '../types';
import type { LoginInput, RegisterInput, User } from '../types/index';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  register: (payload: RegisterInput) => Promise<User>;
  login: (payload: LoginInput) => Promise<User>;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const getStoredToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('nebula_token') : null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistSession = useCallback((token: string, userData: User) => {
    localStorage.setItem('nebula_token', token);
    setUser(userData);
    setError(null);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('nebula_token');
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('nebula_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<ApiSuccess<{ user: User }>>('/auth/me');
      setUser(data.data.user);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const register = async (payload: RegisterInput): Promise<User> => {
    setError(null);
    const { data } = await api.post<ApiSuccess<{ user: User; token: string }>>(
      '/auth/register',
      payload
    );
    persistSession(data.data.token, data.data.user);
    return data.data.user;
  };

  const login = async (payload: LoginInput): Promise<User> => {
    setError(null);
    const { data } = await api.post<ApiSuccess<{ user: User; token: string }>>(
      '/auth/login',
      payload
    );
    persistSession(data.data.token, data.data.user);
    return data.data.user;
  };

  const logout = (): void => {
    clearSession();
  };

  const updateUser = (partial: Partial<User>): void => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      setError,
      register,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(user) || Boolean(getStoredToken()),
    }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
