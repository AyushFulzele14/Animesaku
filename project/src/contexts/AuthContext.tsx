import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiUser, api, clearAccessToken, getAccessToken, setAccessToken } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  avatarUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (name: string, email: string, password: string, role: 'customer' | 'admin') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const toUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  name: apiUser.name,
  role: apiUser.role,
  avatarUrl: apiUser.avatar?.url,
});

function parseLoginResponse(response: { accessToken?: string; user?: ApiUser }): { accessToken: string; user: ApiUser } {
  if (!response?.accessToken || !response?.user) {
    throw new Error('Login failed: invalid server response. Restart backend and try again.');
  }
  return response as { accessToken: string; user: ApiUser };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistUser = useCallback((apiUser: ApiUser) => {
    const normalized = toUser(apiUser);
    setUser(normalized);
    localStorage.setItem('currentUser', JSON.stringify(normalized));
  }, []);

  const clearSession = useCallback(() => {
    clearAccessToken();
    localStorage.removeItem('currentUser');
    setUser(null);
  }, []);

  const checkUser = useCallback(async () => {
    const token = getAccessToken();

    if (!token || token === 'undefined' || token === 'null') {
      clearSession();
      return;
    }

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }

    try {
      const apiUser = await api.get<ApiUser>('/auth/me');
      persistUser(apiUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.toLowerCase().includes('session expired')) {
        clearSession();
        setError('Session expired. Please log in again.');
      }
    }
  }, [clearSession, persistUser]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await checkUser();
      setLoading(false);
    };

    void init();

    // Only sync across browser tabs (not after local login — that would re-verify and can log out)
    const onStorage = () => {
      void checkUser();
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [checkUser]);

  const signUp = useCallback(
    async (name: string, email: string, password: string, role: 'customer' | 'admin' = 'customer') => {
      setError(null);
      try {
        const response = parseLoginResponse(
          await api.post<{ accessToken: string; user: ApiUser }>('/auth/signup', {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
          })
        );
        setAccessToken(response.accessToken);
        persistUser(response.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        setError(message);
        throw err;
      }
    },
    [persistUser]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const response = parseLoginResponse(
          await api.post<{ accessToken: string; user: ApiUser }>('/auth/login', {
            email: email.trim().toLowerCase(),
            password,
          })
        );
        setAccessToken(response.accessToken);
        persistUser(response.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign in failed';
        setError(message);
        throw err;
      }
    },
    [persistUser]
  );

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await api.post('/auth/logout');
    } catch {
      // Allow local logout even if API is unreachable
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      signUp,
      signIn,
      signOut,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }),
    [user, loading, error, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
