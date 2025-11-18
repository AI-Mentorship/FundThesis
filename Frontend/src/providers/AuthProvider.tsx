'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/lib/supabaseClient';

type SupabaseClientInstance = ReturnType<typeof getSupabaseClient>;

type AuthContextValue = {
  supabase: SupabaseClientInstance;
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
  const lastSyncedSessionRef = useRef<{
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    event: AuthChangeEvent | null;
  }>({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    event: null,
  });
  const pendingSyncRef = useRef<Promise<void> | null>(null);

  const shouldSyncSession = (event: AuthChangeEvent, currentSession: Session | null) => {
    const lastSynced = lastSyncedSessionRef.current;

    if (!SESSION_SYNC_EVENTS.includes(event)) {
      return false;
    }

    if (event === 'SIGNED_OUT') {
      return lastSynced.event !== 'SIGNED_OUT';
    }

    const accessToken = currentSession?.access_token ?? null;
    const refreshToken = currentSession?.refresh_token ?? null;
    const expiresAt = currentSession?.expires_at ?? null;

    if (
      lastSynced.accessToken === accessToken &&
      lastSynced.refreshToken === refreshToken &&
      lastSynced.expiresAt === expiresAt &&
      lastSynced.event === event
    ) {
      return false;
    }

    return Boolean(accessToken || refreshToken);
  };

  const syncSession = async (event: AuthChangeEvent, currentSession: Session | null) => {
    if (!shouldSyncSession(event, currentSession)) {
      return;
    }

    if (pendingSyncRef.current) {
      try {
        await pendingSyncRef.current;
      } catch {
        // ignore previous sync failures
      }
    }

    const accessToken = currentSession?.access_token ?? null;
    const refreshToken = currentSession?.refresh_token ?? null;
    const expiresAt = currentSession?.expires_at ?? null;

    const runSync = async () => {
      try {
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, session: currentSession }),
          keepalive: true,
        });

        if (!response.ok) {
          console.error('Failed to sync auth session', response.statusText);
          return;
        }

        lastSyncedSessionRef.current = {
          accessToken,
          refreshToken,
          expiresAt,
          event,
        };
      } catch (error) {
        console.error('Failed to sync auth session', error);
      }
    };

    const syncPromise = runSync().finally(() => {
      if (pendingSyncRef.current === syncPromise) {
        pendingSyncRef.current = null;
      }
    });

    pendingSyncRef.current = syncPromise;

    await syncPromise;
  };

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session) {
        void syncSession('SIGNED_IN', session);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      await syncSession(event, session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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