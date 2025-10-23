'use client'

import React, { useState, useEffect } from 'react'

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const StockTicker = () => {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        console.log('Fetching from:', `${API_URL}/api/stocks?limit=30&offset=0`)
        const response = await fetch(`${API_URL}/api/stocks?limit=30&offset=0`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Received data:', data)
        // Handle both old and new API response formats
        const stocksArray = data.stocks || data
        setStocks(stocksArray)
        setLoading(false)
        setError(null)
      } catch (err) {
        console.error('Error fetching stock data:', err)
        const message = err instanceof Error ? err.message : String(err)
        setError(`Failed to load stock data: ${message}`)
        setLoading(false)
      }
    }

    fetchStocks()
    const interval = setInterval(fetchStocks, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="ticker-bg text-black py-0.5 overflow-hidden">
        <div className="text-center text-sm">Loading stock data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ticker-bg text-black py-0.5 overflow-hidden">
        <div className="text-center text-sm text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="ticker-bg text-black py-0.5 overflow-hidden">
      <div className="animate-marquee-fast whitespace-nowrap">
        <div className="inline-flex space-x-8">
          {stocks.concat(stocks).map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="inline-flex items-center space-x-2 text-sm">
              <span className="font-semibold">{stock.symbol}</span>
              <span>${stock.price.toFixed(2)}</span>
              <span className={`${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </span>
              <span className={`${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StockTicker