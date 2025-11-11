import { supabase } from './supabaseClient';

export interface UserTicker {
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
    .select('user_id, stock_ticker, created_at')
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
export async function deleteUserTicker(userId: string, stockTicker: string): Promise<void> {
  if (!stockTicker) {
    throw new Error('Stock ticker is required');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  // First verify the ticker exists and belongs to the user
  const { data: existing, error: fetchError } = await supabase
    .from('user_account')
    .select('user_id, stock_ticker')
    .eq('user_id', userId)
    .eq('stock_ticker', stockTicker.toUpperCase().trim())
    .single();

  if (fetchError) {
    console.error('Error fetching ticker for deletion:', fetchError);
    throw new Error('Ticker not found or you do not have permission to delete it');
  }

  if (!existing) {
    throw new Error('Ticker not found');
  }

  // Delete the ticker using user_id and stock_ticker (composite key)
  const { error } = await supabase
    .from('user_account')
    .delete()
    .eq('user_id', userId)
    .eq('stock_ticker', stockTicker.toUpperCase().trim());

  if (error) {
    console.error('Error deleting user ticker:', error);
    throw error;
  }
}

