'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { getSupabaseClient } from '@/lib/supabaseClient';

type AuthContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const SESSION_SYNC_EVENTS: AuthChangeEvent[] = ['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'];

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let hasSyncedInitialSession = false;

    const syncSession = async (event: AuthChangeEvent, currentSession: Session | null) => {
      try {
        await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, session: currentSession }),
        });
      } catch (error) {
        console.error('Failed to sync auth session', error);
      }
    };

    const initialise = async () => {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);

      if (data.session && !hasSyncedInitialSession) {
        await syncSession('SIGNED_IN', data.session);
        hasSyncedInitialSession = true;
      }
    };

    initialise();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) {
        return;
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        hasSyncedInitialSession = false;
      }

      if (SESSION_SYNC_EVENTS.includes(event)) {
        await syncSession(event, newSession);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          hasSyncedInitialSession = true;
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(
    () => ({
      supabase,
      session,
      user,
      isLoading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [supabase, session, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

