'use client'

import { useState, useEffect } from 'react'
import { StockCardStack } from '@/components/StockCardStack'

interface Stock {
  symbol: string
  company: string
  price: number
  change: number
  changePercent: number
}

interface StockDetail {
  symbol: string
  company: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  avgVolume: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  peRatio: number
  sector: string
  chartData: Array<{ date: string; price: number }>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function DiscoverPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [stockDetails, setStockDetails] = useState<{ [key: string]: StockDetail }>({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeframe, setTimeframe] = useState<'day' | 'month' | 'year'>('month')

  useEffect(() => { fetchStocks(0) }, [])
  useEffect(() => {
    if (stocks[currentIndex] && !stockDetails[stocks[currentIndex].symbol]) {
      fetchStockDetail(stocks[currentIndex].symbol)
    }
  }, [currentIndex, stocks])
  useEffect(() => { if (stocks[currentIndex]) fetchStockDetail(stocks[currentIndex].symbol) }, [timeframe])

  const fetchStocks = async (offset: number) => {
    try {
      offset === 0 ? setLoading(true) : setLoadingMore(true)
      const res = await fetch(`${API_URL}/api/stocks?limit=20&offset=${offset}`)
      const data = await res.json()
      const mapped = data.stocks.map((s: any) => ({ ...s, company: `${s.symbol} Inc.` }))
      setStocks(prev => offset === 0 ? mapped : [...prev, ...mapped])
      setHasMore(data.hasMore)
    } catch (err) {
      console.error('Error fetching stocks:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchStockDetail = async (symbol: string) => {
    try {
      const days = timeframe === 'day' ? 7 : timeframe === 'month' ? 30 : 365
      const res = await fetch(`${API_URL}/api/stock/${symbol}?days=${days}`)
      const data = await res.json()
      setStockDetails(prev => ({ ...prev, [symbol]: data }))
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err)
    }
  }

  const checkAndLoadMore = (idx: number) => {
    if (!loadingMore && hasMore && idx >= stocks.length - 5) fetchStocks(stocks.length)
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-2">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Discover Stocks</h1>
        <p className="text-lg text-gray-600 mb-2">Explore trending stocks with our interactive card viewer</p>
        <div className="flex items-center justify-center py-20 text-gray-600">Loading stocks...</div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-2">
      <h1 className="text-4xl font-bold text-gray-900 mb-1">Discover Stocks</h1>
      <p className="text-lg text-gray-600 mb-2">Explore trending stocks with our interactive card viewer</p>
      <div className="py-2">
        <StockCardStack 
          stocks={stocks}
          stockDetails={stockDetails}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          loadingMore={loadingMore}
          checkAndLoadMore={checkAndLoadMore}
          fetchStockDetail={fetchStockDetail}
        />
      </div>
    </main>
  )
}

export default DiscoverPage