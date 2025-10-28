'use client'

import { useState, useEffect } from 'react'
import { StockCardStack } from '@/components/StockCard'

interface Stock {
  symbol: string
  company: string
  price: number
  change: number
  changePercent: number
}

interface StockDetailPoint {
  date: string
  price: number
  type?: 'historical' | 'forecast'
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
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  peRatio?: number
  sector: string
  chartData: StockDetailPoint[]
  forecastData?: StockDetailPoint[]
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

  // Fetch initial stocks
  useEffect(() => { 
    console.log('🚀 Fetching initial stocks...')
    fetchStocks(0) 
  }, [])

  // Fetch stock details when currentIndex changes
  useEffect(() => {
    const currentSymbol = stocks[currentIndex]?.symbol
    console.log('📊 Current index changed:', currentIndex, 'Symbol:', currentSymbol)
    if (currentSymbol && !stockDetails[currentSymbol]) {
      console.log('🔍 Fetching details for:', currentSymbol)
      fetchStockDetail(currentSymbol)
    }
  }, [currentIndex, stocks])

  // Refetch stock details when timeframe changes
  useEffect(() => { 
    const currentSymbol = stocks[currentIndex]?.symbol
    console.log('⏰ Timeframe changed to:', timeframe, 'for symbol:', currentSymbol)
    if (currentSymbol) fetchStockDetail(currentSymbol)
  }, [timeframe])

  const fetchStocks = async (offset: number) => {
    try {
      offset === 0 ? setLoading(true) : setLoadingMore(true)
      console.log('📡 Fetching stocks from API...')
      const res = await fetch(`${API_URL}/api/stocks?limit=20&offset=${offset}`)
      const data = await res.json()
      console.log('✅ Stocks received:', data.stocks.length)
      const mapped = data.stocks.map((s: any) => ({ ...s, company: `${s.symbol} Inc.` }))
      setStocks(prev => offset === 0 ? mapped : [...prev, ...mapped])
      setHasMore(data.hasMore)
    } catch (err) {
      console.error('❌ Error fetching stocks:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchStockDetail = async (symbol: string) => {
    try {
      const days = timeframe === 'day' ? 7 : timeframe === 'month' ? 30 : 365
      console.log(`📡 Fetching details for ${symbol} (${days} days)...`)
      const res = await fetch(`${API_URL}/api/stock/${symbol}?days=${days}`)
      const data: StockDetail = await res.json()
      
      console.log(`✅ Data received for ${symbol}:`, {
        historicalPoints: data.chartData?.length || 0,
        forecastPoints: data.forecastData?.length || 0,
        chartData: data.chartData,
        forecastData: data.forecastData
      })

      // Safely map historical and forecast points
      const historical = (data.chartData ?? []).map(d => ({ ...d, type: 'historical' as const }))
      const forecast = (data.forecastData ?? []).map(d => ({ ...d, type: 'forecast' as const }))

      console.log(`🎨 Mapped data:`, {
        historical: historical.length,
        forecast: forecast.length,
        sample: historical[0],
        forecastSample: forecast[0]
      })

      setStockDetails(prev => ({
        ...prev,
        [symbol]: {
          ...data,
          chartData: historical,
          forecastData: forecast
        }
      }))
    } catch (err) {
      console.error(`❌ Error fetching ${symbol}:`, err)
    }
  }

  const checkAndLoadMore = (idx: number) => {
    if (!loadingMore && hasMore && idx >= stocks.length - 5) {
      console.log('📥 Loading more stocks...')
      fetchStocks(stocks.length)
    }
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

  const currentSymbol = stocks[currentIndex]?.symbol
  const stockDetail = currentSymbol ? stockDetails[currentSymbol] : undefined
  const combinedChartData = [
    ...(stockDetail?.chartData ?? []),
    ...(stockDetail?.forecastData ?? [])
  ]

  console.log('🎯 Rendering with:', {
    currentSymbol,
    hasDetail: !!stockDetail,
    combinedPoints: combinedChartData.length,
    historicalPoints: stockDetail?.chartData?.length || 0,
    forecastPoints: stockDetail?.forecastData?.length || 0
  })

  return (
    <main className="max-w-7xl mx-auto px-4 py-2">
      <h1 className="text-4xl font-bold text-gray-900 mb-1">Discover Stocks</h1>
      <p className="text-lg text-gray-600 mb-2">Explore trending stocks with our interactive card viewer</p>
      <div className="py-2">
        <StockCardStack 
          stocks={stocks}
          stockDetails={stockDetails}
          combinedChartData={combinedChartData} 
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