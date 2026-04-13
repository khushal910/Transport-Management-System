import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchBackend } from '@/lib/api';
import type { UserRole } from '@/types/fleet';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  company: Record<string, any> | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface ProfileResponse {
  personal: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  company: { id: string; name: string; [key: string]: any } | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchBackend<ProfileResponse>('/api/auth/profile');
      if (res.data) {
        setUser({
          id: res.data.personal.id,
          name: res.data.personal.name,
          email: res.data.personal.email,
          role: res.data.personal.role,
          companyId: res.data.company?.id ?? '',
          company: res.data.company,
        });
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetchBackend('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore errors on logout
    }
    setUser(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refetch: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
