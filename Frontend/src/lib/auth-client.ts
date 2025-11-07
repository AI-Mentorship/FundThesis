'use client'

import { supabase } from './supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const authClient = {
  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    },
  },
  signUp: {
    email: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      })
      return { data, error }
    },
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
}

export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      if (!session) {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return { data: { session, user: session?.user }, isLoading: loading }
}

