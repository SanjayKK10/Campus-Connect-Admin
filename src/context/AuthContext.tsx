import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

interface AdminProfile {
  admin_id: string;
  name: string;
  email: string;
  created_at: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  profile: AdminProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const supabase = getSupabaseClient();

    const handleSession = async (session: Session | null) => {
      try {
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('admin_id', session.user.id)
            .single();

          if (error || !data) {
            await supabase.auth.signOut();
            if (!isMounted) return;
            setIsAuthenticated(false);
            setProfile(null);
            return;
          }

          if (!isMounted) return;
          setIsAuthenticated(true);
          setProfile(data as AdminProfile);
          return;
        }

        if (!isMounted) return;
        setIsAuthenticated(false);
        setProfile(null);
      } catch (err) {
        console.error('Auth session error:', err);
        if (!isMounted) return;
        setIsAuthenticated(false);
        setProfile(null);
      }
    };

    const restoreSession = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Failed to restore auth session:', error);
        }

        await handleSession(data?.session ?? null);
      } catch (err) {
        console.error('Unexpected auth restore error:', err);
        if (isMounted) {
          setIsAuthenticated(false);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return;
      }

      setIsLoading(true);
      await handleSession(session);
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, profile, isLoading, logout }),
    [isAuthenticated, profile, isLoading, logout],
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
