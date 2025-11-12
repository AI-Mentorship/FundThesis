'use client'

import { useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { StockCard } from './StockCard'

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

interface StockCardStackProps {
  stocks: Stock[]
  stockDetails: { [key: string]: StockDetail }
  currentIndex: number
  setCurrentIndex: (index: number) => void
  timeframe: 'day' | 'month' | 'year' | 'all'
  setTimeframe: (timeframe: 'day' | 'month' | 'year' | 'all') => void
  loadingMore: boolean
  checkAndLoadMore: (index: number) => void
  fetchStockDetail: (symbol: string) => Promise<void>
  // New prop: completely custom expanded modal component
  ExpandedModal?: React.ComponentType<{
    stock: StockDetail
    onClose: () => void
    timeframe: 'day' | 'month' | 'year' | 'all'
    setTimeframe: (timeframe: 'day' | 'month' | 'year' | 'all') => void
    fetchStockDetail: (symbol: string) => Promise<void>
    stockDetails: { [key: string]: StockDetail }
  }>
}

export function StockCardStack({
  stocks,
  stockDetails,
  currentIndex,
  setCurrentIndex,
  timeframe,
  setTimeframe,
  loadingMore,
  checkAndLoadMore,
  fetchStockDetail,
  ExpandedModal
}: StockCardStackProps) {
  const [expandedStock, setExpandedStock] = useState<StockDetail | null>(null)

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + stocks.length) % stocks.length
    setCurrentIndex(newIndex)
    checkAndLoadMore(newIndex)
  }

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % stocks.length
    setCurrentIndex(newIndex)
    checkAndLoadMore(newIndex)
  }

  const handleCardClick = (stock: Stock, index: number) => {
    if (index === currentIndex) {
      const detail = stockDetails[stock.symbol]
      if (detail) {
        setExpandedStock(detail)
      }
    } else {
      setCurrentIndex(index)
    }
  }

  const closeExpanded = () => {
    setExpandedStock(null)
  }

  const getCardStyle = (stockIndex: number) => {
    let relativePosition = stockIndex - currentIndex
    
    if (relativePosition > stocks.length / 2) {
      relativePosition -= stocks.length
    } else if (relativePosition < -stocks.length / 2) {
      relativePosition += stocks.length
    }

    const distance = Math.abs(relativePosition)
    
    if (distance === 0) {
      return { transform: 'translateX(0) scale(1)', zIndex: 30, filter: 'blur(0px)', opacity: 1 }
    } else if (distance === 1) {
      return { transform: `translateX(${relativePosition > 0 ? '180px' : '-180px'}) scale(0.85)`, zIndex: 20, filter: 'blur(2px)', opacity: 0.6 }
    } else if (distance === 2) {
      return { transform: `translateX(${relativePosition > 0 ? '300px' : '-300px'}) scale(0.7)`, zIndex: 10, filter: 'blur(4px)', opacity: 0.3 }
    } else {
      return { transform: `translateX(${relativePosition > 0 ? '400px' : '-400px'}) scale(0.6)`, zIndex: 1, filter: 'blur(6px)', opacity: 0 }
    }
  }

  if (stocks.length === 0) {
    return <div className="flex items-center justify-center h-auto py-20"><div className="text-gray-600">No stocks available</div></div>
  }

  const currentStock = stocks[currentIndex]

  return (
    <>
      <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto px-8">
        <button onClick={goToPrevious} className="absolute left-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group">
          <ChevronLeft className="w-6 h-6 text-gray-900 group-hover:text-[#9DB38A] transition-colors" />
        </button>

        <div className="relative w-full min-h-[950px] flex items-center justify-center py-8">
          {stocks.map((stock, index) => {
            const detail = stockDetails[stock.symbol];
            const chartData = detail
              ? [
                  ...(detail.chartData?.map((d) => ({ ...d, type: "historical" as const })) || []),
                  ...(detail.forecastData?.map((d) => ({ ...d, type: "forecast" as const })) || []),
                ]
              : [];
            
            return (
              <div key={`${stock.symbol}-${index}`} className="absolute w-full max-w-[650px] min-h-[900px] transition-all duration-500 ease-out cursor-pointer" style={getCardStyle(index)}>
                <StockCard
                  stock={stock}
                  detail={detail}
                  isActive={index === currentIndex}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  onClick={() => handleCardClick(stock, index)}
                  chartData={chartData}
                />
              </div>
            );
          })}
        </div>

        <button onClick={goToNext} className="absolute right-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group">
          <ChevronRight className="w-6 h-6 text-gray-900 group-hover:text-[#9DB38A] transition-colors" />
        </button>

        <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex space-x-2 items-center">
          {stocks.map((_, index) => (
            <button key={index} onClick={() => { setCurrentIndex(index); checkAndLoadMore(index) }} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-[#9DB38A] w-6' : 'bg-gray-400 hover:bg-gray-600'}`} />
          ))}
          {loadingMore && <div className="ml-2 text-sm text-gray-500">Loading more...</div>}
        </div>
      </div>

      {expandedStock && ExpandedModal && (() => {
        const modal = (
          <ExpandedModal
            stock={expandedStock}
            onClose={closeExpanded}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            fetchStockDetail={fetchStockDetail}
            stockDetails={stockDetails}
          />
        )

        // Render modal into document.body to avoid being clipped by parent transforms
        if (typeof document !== 'undefined') {
          return createPortal(modal, document.body)
        }

        return modal
      })()}
    </>
  )
}