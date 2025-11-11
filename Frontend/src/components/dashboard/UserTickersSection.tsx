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

  const handleDeleteTicker = async (tickerId: string) => {
    if (!userId) return

    try {
      await deleteUserTicker(userId, tickerId)
      setTickers(tickers.filter(t => t.id !== tickerId))
    } catch (err: any) {
      setError(err.message || 'Failed to delete ticker')
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
            {tickers.map((ticker) => (
              <div
                key={ticker.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-900">{ticker.stock_ticker}</span>
                <button
                  onClick={() => ticker.id && handleDeleteTicker(ticker.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove ticker"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

