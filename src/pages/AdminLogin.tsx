import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ThunderLogo from '../components/ThunderLogo';
import { useAuth } from '../context/AuthContext';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

export default function AdminLogin() {
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f9f6ff] via-[#f4efff] to-white">
        <p style={{ color: 'var(--color-cc-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured.');
        return;
      }

      const supabase = getSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Login failed. Please try again.');
      }
      // On success, the auth listener will update the state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f9f6ff] via-[#f4efff] to-white px-4 py-10">
      <div className="glass-card w-full max-w-md p-8 shadow-xl shadow-violet-200/40">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <ThunderLogo
              size="lg"
              subtitle="where youth become innovators"
            />
          </div>
          <p className="mt-6 text-sm text-slate-500">Admin verification portal</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-5 rounded-xl border border-violet-200/70 bg-violet-50 px-4 py-3 text-sm text-violet-700">
            Supabase is not configured. Add your project URL and anon key to `.env` before
            loading requests.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-300 focus:ring-1 focus:ring-violet-200 disabled:opacity-50"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-300 focus:ring-1 focus:ring-violet-200 disabled:opacity-50"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-accent w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
