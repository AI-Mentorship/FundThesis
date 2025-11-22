import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { PerformerCard } from '@/components/ui/PerformerCard'
import { TrendingUp } from 'lucide-react'

interface Performer {
  rank: number
  symbol: string
  name: string
  price: string
  change: string
  percent: string
}

interface PerformersSectionProps {
  performers: Performer[]
  className?: string
}

export function PerformersSection({ performers, className = "" }: PerformersSectionProps) {
  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-xl font-bold">Best Performers</h2>
        </div>
        <div className="space-y-3">
          {performers.map((performer) => (
            <PerformerCard
              key={performer.rank}
              performer={performer}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

