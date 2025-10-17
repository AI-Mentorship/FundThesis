'use client'

import React, { useState, useEffect } from 'react'

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

const StockTicker = () => {
  const [stocks, setStocks] = useState<StockData[]>([
    { symbol: 'AAPL', price: 175.43, change: 2.15, changePercent: 1.24 },
    { symbol: 'GOOGL', price: 142.56, change: -1.23, changePercent: -0.85 },
    { symbol: 'MSFT', price: 378.85, change: 4.67, changePercent: 1.25 },
    { symbol: 'TSLA', price: 248.50, change: -3.45, changePercent: -1.37 },
    { symbol: 'AMZN', price: 145.78, change: 1.89, changePercent: 1.31 },
    { symbol: 'NVDA', price: 875.28, change: 12.45, changePercent: 1.44 },
    { symbol: 'META', price: 352.14, change: -2.67, changePercent: -0.75 },
    { symbol: 'NFLX', price: 425.67, change: 5.23, changePercent: 1.24 }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: (Math.random() - 0.5) * 5,
          changePercent: (Math.random() - 0.5) * 2
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="ticker-bg text-white py-0.5 overflow-hidden">
      <div className="animate-marquee-fast whitespace-nowrap">
        <div className="inline-flex space-x-8">
          {stocks.concat(stocks).map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="inline-flex items-center space-x-2 text-sm">
              <span className="font-semibold">{stock.symbol}</span>
              <span>${stock.price.toFixed(2)}</span>
              <span className={`${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </span>
              <span className={`${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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