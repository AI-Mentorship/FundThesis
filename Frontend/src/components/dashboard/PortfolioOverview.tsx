import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { StatsCard } from '@/components/ui/StatsCard'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PortfolioOverviewProps {
  totalValue: string
  stats: Array<{
    label: string
    value: string
    description: string
    positive: boolean
    icon: typeof TrendingUp | typeof TrendingDown
  }>
  className?: string
}

export function PortfolioOverview({ totalValue, stats, className = "" }: PortfolioOverviewProps) {
  return (
    <Card className={className}>
      <CardContent>
        <h2 className="text-xl font-bold mb-3">Portfolio Overview</h2>
        <div className="mb-4">
          <p className="text-4xl font-bold text-gray-600 mb-1">{totalValue}</p>
          <p className="text-sm text-gray-500">Total Portfolio Value</p>
        </div>
        
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            positive={stat.positive}
            icon={stat.icon}
            className="mb-3"
          />
        ))}
      </CardContent>
    </Card>
  )
}

