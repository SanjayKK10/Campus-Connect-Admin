import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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

    const supabase = getSupabaseClient();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);

      try {
        if (session?.user?.id) {
          // User is authenticated, verify admin status
          const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('admin_id', session.user.id)
            .single();

          if (error || !data) {
            // No admin record found, sign out
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setProfile(null);
          } else {
            // Admin record found, set authenticated state
            setIsAuthenticated(true);
            setProfile(data as AdminProfile);
          }
        } else {
          // No session
          setIsAuthenticated(false);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setIsAuthenticated(false);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
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
