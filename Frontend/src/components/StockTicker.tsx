'use client'

import React, { useState, useEffect } from 'react'

interface StockData {
  symbol: string
  price?: number
  change?: number
  changePercent?: number
}

// Use Next.js API routes instead of external Flask server
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const formatNumber = (value?: number, decimals = 2) =>
  typeof value === 'number' ? value.toFixed(decimals) : '-'

const StockTicker = () => {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchStocks = async () => {
      try {
        const response = await fetch(`/api/stocks?limit=30&offset=0`)
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
        const data = await response.json()
        if (!isMounted) return

        const stocksArray: StockData[] = data.stocks || data
        setStocks(stocksArray)
        setLoading(false)
        setError(null)
      } catch (err) {
        if (!isMounted) return
        const message = err instanceof Error ? err.message : String(err)
        setError(`Failed to load stock data: ${message}`)
        setLoading(false)
      }
    }

    fetchStocks()
    const interval = setInterval(fetchStocks, 60000)
    return () => { isMounted = false; clearInterval(interval) }
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
              <span>${formatNumber(stock.price)}</span>
              <span className={stock.change && stock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stock.change ? (stock.change >= 0 ? '+' : '') + formatNumber(stock.change) : '-'}
              </span>
              <span className={stock.changePercent && stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                ({stock.changePercent ? (stock.changePercent >= 0 ? '+' : '') + formatNumber(stock.changePercent) + '%' : '-'})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StockTicker
