import { supabase } from './supabaseClient';

export interface UserTicker {
  id?: string;
  user_id: string;
  stock_ticker: string;
  created_at?: string;
}

/**
 * Fetch all tickers for the current user
 */
export async function getUserTickers(userId: string): Promise<UserTicker[]> {
  const { data, error } = await supabase
    .from('user_account')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user tickers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new ticker for the current user
 */
export async function addUserTicker(userId: string, ticker: string): Promise<UserTicker> {
  // Validate ticker format (uppercase, alphanumeric, 1-5 chars)
  const normalizedTicker = ticker.toUpperCase().trim();
  
  if (!normalizedTicker || normalizedTicker.length === 0) {
    throw new Error('Ticker cannot be empty');
  }

  if (normalizedTicker.length > 5) {
    throw new Error('Ticker must be 5 characters or less');
  }

  // Check if ticker already exists for this user
  const { data: existing } = await supabase
    .from('user_account')
    .select('*')
    .eq('user_id', userId)
    .eq('stock_ticker', normalizedTicker)
    .single();

  if (existing) {
    throw new Error('Ticker already exists in your list');
  }

  const { data, error } = await supabase
    .from('user_account')
    .insert({
      user_id: userId,
      stock_ticker: normalizedTicker
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding user ticker:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a ticker for the current user
 */
export async function deleteUserTicker(userId: string, tickerId: string): Promise<void> {
  const { error } = await supabase
    .from('user_account')
    .delete()
    .eq('id', tickerId)
    .eq('user_id', userId); // Ensure user can only delete their own tickers

  if (error) {
    console.error('Error deleting user ticker:', error);
    throw error;
  }
}

