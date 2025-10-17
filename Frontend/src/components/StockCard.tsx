'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Stock {
  symbol: string
  company: string
  logo: string
  price: number
  change: number
  changePercent: number
}

const stocks: Stock[] = [
  { symbol: 'AAPL', company: 'Apple Inc.', logo: '🍎', price: 175.43, change: 2.15, changePercent: 1.24 },
  { symbol: 'MSFT', company: 'Microsoft Corporation', logo: '🪟', price: 378.85, change: 4.67, changePercent: 1.25 },
  { symbol: 'META', company: 'Meta Platforms Inc.', logo: '📘', price: 352.14, change: -2.67, changePercent: -0.75 },
  { symbol: 'GOOGL', company: 'Alphabet Inc.', logo: '🔍', price: 142.56, change: -1.23, changePercent: -0.85 },
  { symbol: 'AMZN', company: 'Amazon.com Inc.', logo: '📦', price: 145.78, change: 1.89, changePercent: 1.31 },
  { symbol: 'TSLA', company: 'Tesla Inc.', logo: '⚡', price: 248.50, change: -3.45, changePercent: -1.37 },
  { symbol: 'NVDA', company: 'NVIDIA Corporation', logo: '🎮', price: 875.28, change: 12.45, changePercent: 1.44 },
]

export function StockCardStack() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? stocks.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === stocks.length - 1 ? 0 : prev + 1))
  }

  const getCardStyle = (index: number) => {
    const distance = Math.abs(index - currentIndex)
    const direction = index - currentIndex
    
    if (distance === 0) {
      return {
        transform: 'translateX(0) scale(1)',
        zIndex: 30,
        filter: 'blur(0px)',
        opacity: 1,
      }
    } else if (distance === 1) {
      return {
        transform: `translateX(${direction > 0 ? '180px' : '-180px'}) scale(0.85)`,
        zIndex: 20,
        filter: 'blur(2px)',
        opacity: 0.6,
      }
    } else {
      return {
        transform: `translateX(${direction > 0 ? '300px' : '-300px'}) scale(0.7)`,
        zIndex: 10,
        filter: 'blur(4px)',
        opacity: 0.3,
      }
    }
  }

  const currentStock = stocks[currentIndex]

  return (
    <div className="relative flex items-center justify-center w-full max-w-6xl mx-auto px-8">
      {/* Left Navigation Arrow */}
      <button
        onClick={goToPrevious}
        className="absolute left-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
      >
        <ChevronLeft className="w-6 h-6 text-gray-900 group-hover:text-green-600 transition-colors" />
      </button>

      {/* Card Stack Container */}
      <div className="relative w-[500px] h-[700px] flex items-center justify-center">
        {stocks.map((stock, index) => (
          <div
            key={stock.symbol}
            className="absolute w-[400px] h-[650px] transition-all duration-500 ease-out cursor-pointer"
            style={getCardStyle(index)}
            onClick={() => setCurrentIndex(index)}
          >
            {/* White Card */}
            <div className="w-full h-full rounded-3xl bg-white shadow-2xl p-8 flex flex-col justify-between border-2 border-gray-200 hover:border-green-400 transition-all duration-300">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
                    {stock.logo}
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-2xl font-bold">{stock.symbol}</h3>
                    <p className="text-gray-600 text-sm">{stock.company}</p>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="text-center py-6">
                <p className="text-gray-900 text-5xl font-bold">${stock.price.toFixed(2)}</p>
                <p className={`text-xl font-semibold mt-2 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </p>
              </div>

              {/* Card Content - Placeholder for now */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 w-full">
                  <div className="w-full h-64 rounded-2xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Chart Placeholder</div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-center space-x-3 mt-6">
                <div className="px-4 py-2 rounded-full bg-green-100 border-2 border-green-400">
                  <span className="text-green-600 text-sm font-semibold">Buy</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-gray-100 border-2 border-gray-300">
                  <span className="text-gray-600 text-sm font-semibold">Hold</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Navigation Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
      >
        <ChevronRight className="w-6 h-6 text-gray-900 group-hover:text-green-600 transition-colors" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex space-x-2">
        {stocks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-green-400 w-6'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}