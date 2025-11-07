import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for user_account rows
export type UserAccountRow = {
  id?: number
  user_id: string
  stock_ticker: string
}

/**
 * Fetch the current user's portfolio from the `user_account` table.
 * Returns an array of rows where each row represents a single ticker for that user.
 */
export const getUserPortfolio = async (): Promise<UserAccountRow[]> => {
  const user = await supabase.auth.getUser()
  if (!user.data.user) return []

  const { data, error } = await supabase
    .from('user_account')
    .select('id, user_id, stock_ticker')
    .eq('user_id', user.data.user.id)

  if (error) console.error('getUserPortfolio error:', error)
  return (data ?? []) as UserAccountRow[]
}

/**
 * Insert a ticker into `user_account` for the current user.
 * Returns the inserted row(s) or null on failure.
 */
export const addTicker = async (ticker: string) => {
  const user = await supabase.auth.getUser()
  if (!user.data.user) return null

  const { data, error } = await supabase
    .from('user_account')
    .insert([{ user_id: user.data.user.id, stock_ticker: ticker }])
    .select()

  if (error) console.error('addTicker error:', error)
  return data
}



