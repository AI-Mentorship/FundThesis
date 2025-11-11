'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { getCurrentUser } from '@/lib/supabaseClient'
import { getUserTickers, addUserTicker, deleteUserTicker, type UserTicker } from '@/lib/tickerService'
import { X, Plus } from 'lucide-react'

export function UserTickersSection() {
  const [tickers, setTickers] = useState<UserTicker[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null) // Track which ticker symbol is being deleted
  const [newTicker, setNewTicker] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadTickers() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          setError('Please log in to view your tickers')
          setLoading(false)
          return
        }

        setUserId(user.id)
        const userTickers = await getUserTickers(user.id)
        setTickers(userTickers)
      } catch (err: any) {
        console.error('Error loading tickers:', err)
        setError(err.message || 'Failed to load tickers')
      } finally {
        setLoading(false)
      }
    }

    loadTickers()
  }, [])

  const handleAddTicker = async () => {
    if (!newTicker.trim() || !userId) return

    setAdding(true)
    setError(null)

    try {
      const ticker = await addUserTicker(userId, newTicker.trim())
      setTickers([ticker, ...tickers])
      setNewTicker('')
    } catch (err: any) {
      setError(err.message || 'Failed to add ticker')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteTicker = async (stockTicker: string) => {
    if (!userId || !stockTicker) {
      setError('Invalid ticker')
      return
    }

    setDeleting(stockTicker)
    setError(null)

    try {
      // Optimistically update UI
      setTickers(tickers.filter(t => t.stock_ticker !== stockTicker))

      // Perform actual deletion using user_id and stock_ticker
      await deleteUserTicker(userId, stockTicker)
      
      // Verify deletion was successful by checking if ticker still exists
      const updatedTickers = await getUserTickers(userId)
      setTickers(updatedTickers)
    } catch (err: any) {
      console.error('Error deleting ticker:', err)
      // Revert optimistic update on error
      const userTickers = await getUserTickers(userId)
      setTickers(userTickers)
      setError(err.message || 'Failed to delete ticker. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTicker()
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">My Stock Tickers</h2>
          <div className="text-gray-600">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">My Stock Tickers</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Add Ticker Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter ticker symbol (e.g., AAPL)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={5}
          />
          <button
            onClick={handleAddTicker}
            disabled={adding || !newTicker.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>

        {/* Tickers List */}
        {tickers.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No tickers added yet. Add your first ticker above!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tickers.map((ticker, index) => {
              // Use combination of user_id and stock_ticker for unique key
              const uniqueKey = `${ticker.user_id}-${ticker.stock_ticker}-${index}`
              const isDeleting = deleting === ticker.stock_ticker
              return (
                <div
                  key={uniqueKey}
                  className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="font-semibold text-gray-900">{ticker.stock_ticker}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isDeleting) {
                        handleDeleteTicker(ticker.stock_ticker)
                      }
                    }}
                    disabled={isDeleting}
                    className={`ml-2 p-1 transition-colors ${
                      isDeleting
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                    title={isDeleting ? 'Removing...' : 'Remove ticker'}
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

