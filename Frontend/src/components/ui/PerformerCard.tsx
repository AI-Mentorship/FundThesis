import React from 'react'

interface Performer {
  rank: number
  symbol: string
  name: string
  price: string
  change: string
  percent: string
}

interface PerformerCardProps {
  performer: Performer
  className?: string
}

export function PerformerCard({ performer, className = "" }: PerformerCardProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{performer.rank}</span>
        <div>
          <p className="text-sm font-semibold">{performer.symbol}</p>
          <p className="text-xs text-gray-500">{performer.name}</p>
          <p className="text-xs text-gray-600">
            {performer.price} <span className="text-green-600">{performer.percent}</span>
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{performer.price}</p>
        <p className="text-xs text-green-600">{performer.change}</p>
      </div>
    </div>
  )
}

