'use client';

import { createContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const DEMO_USER_ID = 'demo-user-' + (typeof window !== 'undefined' ? 'browser' : 'ssr');

interface AuthContextType {
  user: User | null;
  session: Session | null;
  username: string | null;
  loading: boolean;
  error: string | null;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User for demo mode
const createDemoUser = (): User => {
  const now = new Date().toISOString();
  return {
    id: DEMO_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'demo@example.com',
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'demo' },
    user_metadata: { demo: true },
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  } as unknown as User;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsername = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUsername(data?.username || null);
    } catch (error) {
      console.error('Failed to fetch username:', error);
      setUsername(null);
    }
  }, []);

  useEffect(() => {
    if (DEMO_MODE) {
      const demoUser = createDemoUser();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(demoUser);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsername('Demo User');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchUsername(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchUsername(session.user.id);
      } else {
        setUsername(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, [fetchUsername]);

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    if (DEMO_MODE) {
      setUsername(username);
      setError(null);
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setUsername(username);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '登録に失敗しました';
      setError(errorMsg);
      console.error('Sign up error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (DEMO_MODE) {
      setError(null);
      return;
    }

    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'ログインに失敗しました';
      setError(errorMsg);
      console.error('Sign in error:', err);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    if (DEMO_MODE) {
      setError(null);
      return;
    }

    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Google ログインに失敗しました';
      setError(errorMsg);
      console.error('Google sign in error:', err);
      throw err;
    }
  };

  const signInWithGitHub = async () => {
    if (DEMO_MODE) {
      setError(null);
      return;
    }

    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'GitHub ログインに失敗しました';
      setError(errorMsg);
      console.error('GitHub sign in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null);
      setSession(null);
      setUsername(null);
      setError(null);
      return;
    }

    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setUsername(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'ログアウトに失敗しました';
      setError(errorMsg);
      console.error('Sign out error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, username, loading, error, signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithGitHub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
