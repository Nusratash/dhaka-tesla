'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; phone: string; role: 'passenger' | 'driver' }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Minimal client-side auth: token + user cached in localStorage, restored
// on mount. Good enough for this MVP; see README trade-offs for the
// httpOnly-cookie alternative for a production build.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const raw = window.localStorage.getItem('tesla_pool_user');
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  function persist(token: string, u: AuthUser) {
    window.localStorage.setItem('tesla_pool_token', token);
    window.localStorage.setItem('tesla_pool_user', JSON.stringify(u));
    setUser(u);
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.accessToken, data.user);
    router.push(data.user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard');
  }

  async function register(payload: { email: string; password: string; fullName: string; phone: string; role: 'passenger' | 'driver' }) {
    const { data } = await api.post('/auth/register', payload);
    persist(data.accessToken, data.user);
    router.push(data.user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard');
  }

  function logout() {
    window.localStorage.removeItem('tesla_pool_token');
    window.localStorage.removeItem('tesla_pool_user');
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
