"use client"

import React, { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import StockTicker from '@/components/StockTicker'
import { getUserPortfolio, addTicker, UserAccountRow } from '@/lib/supabase'

export default function PortfolioPage() {
  const [rows, setRows] = useState<UserAccountRow[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [ticker, setTicker] = useState('')

  const fetchPortfolio = async () => {
    setLoading(true)
    try {
      const data = await getUserPortfolio()
      setRows(data)
    } catch (err) {
      console.error('fetchPortfolio error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const handleAdd = async () => {
    if (!ticker.trim()) return
    setAdding(true)
    try {
      const inserted = await addTicker(ticker.trim().toUpperCase())
      // If insertion returned rows, refresh; otherwise try a full refresh
      if (inserted && Array.isArray(inserted)) {
        // append newly inserted rows to state (defensive)
        setRows((prev) => [...prev, ...inserted])
      } else {
        await fetchPortfolio()
      }
      setTicker('')
    } catch (err) {
      console.error('add ticker error', err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <StockTicker />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Portfolio</h1>
        <p className="text-xl text-gray-600 mb-8">Manage and optimize your investment portfolio</p>

        <div className="mb-6 flex items-center gap-3">
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter ticker (e.g. AAPL)"
            className="border rounded-md px-3 py-2"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !ticker.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Ticker'}
          </button>
          <button
            onClick={fetchPortfolio}
            disabled={loading}
            className="ml-2 bg-gray-200 px-3 py-2 rounded-md"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Your Holdings</h2>
            <div className="text-sm text-gray-600">{loading ? 'Loading…' : `${rows.length} tickers`}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.length === 0 && !loading ? (
                  <tr>
                    <td className="px-6 py-4 text-gray-600">No tickers yet. Add one above.</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id ?? r.stock_ticker}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{r.stock_ticker}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
