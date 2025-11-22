import React from 'react'

interface Stock {
  symbol: string
  change: string
  positive: boolean
}

interface NewsCardProps {
  title: string
  source: string
  text: string
  stocks: Stock[]
  className?: string
}

export function NewsCard({ title, source, text, stocks, className = "" }: NewsCardProps) {
  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs text-gray-500">{source}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{text}</p>
      <div className="flex flex-wrap gap-4">
        {stocks.map((stock, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm font-medium">{stock.symbol}</span>
            <span className={`text-sm ${stock.positive ? 'text-green-600' : 'text-red-600'}`}>
              {stock.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

