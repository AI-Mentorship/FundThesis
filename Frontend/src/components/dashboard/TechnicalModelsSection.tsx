import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Info } from 'lucide-react'

interface TechnicalModelsSectionProps {
  className?: string
}

export function TechnicalModelsSection({ className = "" }: TechnicalModelsSectionProps) {
  const models = ["Time-Series Forecast", "XGBoost Signal", "Event-Based Model"]
  
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-3">Technical Models Explorer</h2>
      <Card>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {models.map((model, i) => (
              <button 
                key={i} 
                className={`py-2 px-4 rounded-lg text-sm font-medium ${
                  i === 0 ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
          <div className="h-64 bg-gray-50 rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Accuracy</span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold">87.2%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Confidence</span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold">High</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

