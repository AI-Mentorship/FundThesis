import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { IndexCard } from '@/components/ui/IndexCard'

interface Index {
  color: string
  name: string
  description: string
}

interface IndexesSectionProps {
  indexes: Index[]
  className?: string
}

export function IndexesSection({ indexes, className = "" }: IndexesSectionProps) {
  return (
    <Card className={className}>
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Fundthesis Indexes</h2>
        <div className="h-64 bg-gray-50 rounded-lg mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indexes.map((index, i) => (
            <IndexCard
              key={i}
              color={index.color}
              name={index.name}
              description={index.description}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

