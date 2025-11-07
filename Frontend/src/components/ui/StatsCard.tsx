import React from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string
  description: string
  positive: boolean
  icon: typeof TrendingUp | typeof TrendingDown
  className?: string
}

export function StatsCard({ 
  label, 
  value, 
  description, 
  positive, 
  icon: Icon, 
  className = "" 
}: StatsCardProps) {
  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <Info className="w-4 h-4 text-gray-400" />
      </div>
      <p className={`text-2xl font-bold mb-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

