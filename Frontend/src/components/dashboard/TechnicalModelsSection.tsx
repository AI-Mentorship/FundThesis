'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getCurrentUser } from '@/lib/supabaseClient'
import { getUserTickers } from '@/lib/tickerService'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface TechnicalModelsSectionProps {
  className?: string
}

interface PredictionPoint {
  date: string
  predictedPrice: number
}

export function TechnicalModelsSection({ className = "" }: TechnicalModelsSectionProps) {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [userTickers, setUserTickers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<PredictionPoint[]>([])
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<string>('Low')
  const [mse, setMse] = useState<number | null>(null)
  const [r2, setR2] = useState<number | null>(null)

  useEffect(() => {
    async function loadUserTickers() {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const tickers = await getUserTickers(user.id)
        const symbols = tickers.map(t => t.stock_ticker)
        setUserTickers(symbols)

        if (symbols.length > 0 && !selectedTicker) {
          setSelectedTicker(symbols[0])
        }
      } catch (error) {
        console.error('Error loading user tickers:', error)
      }
    }

    loadUserTickers()
  }, [])

  useEffect(() => {
    async function loadPredictions() {
      if (!selectedTicker) return

      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/technical-models/${selectedTicker}`)
        if (!response.ok) {
          throw new Error('Failed to fetch predictions')
        }

        const data = await response.json()
        setPredictions(data.predictions || [])
        setAccuracy(data.metrics?.accuracy || null)
        setConfidence(data.metrics?.confidence || 'Low')
        setMse(data.metrics?.mse || null)
        setR2(data.metrics?.r2 || null)
      } catch (error) {
        console.error('Error loading predictions:', error)
        setPredictions([])
        setAccuracy(null)
        setConfidence('Low')
      } finally {
        setLoading(false)
      }
    }

    loadPredictions()
  }, [selectedTicker])

  const models = ["XGBoost Forecast"]
  
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-3">Technical Models Explorer</h2>
      <Card>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Ticker
            </label>
            {userTickers.length > 0 ? (
              <select
                value={selectedTicker || ''}
                onChange={(e) => setSelectedTicker(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {userTickers.map((ticker) => (
                  <option key={ticker} value={ticker}>
                    {ticker}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">Add tickers to your portfolio to see predictions</p>
            )}
          </div>

          {loading ? (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Loading predictions...</p>
            </div>
          ) : predictions.length > 0 ? (
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis 
                    domain={(() => {
                      if (predictions.length === 0) return ['auto', 'auto']
                      
                      const prices = predictions
                        .map(p => p.predictedPrice)
                        .filter(p => p != null && !isNaN(p) && p > 0)
                      
                      if (prices.length === 0) return ['auto', 'auto']
                      
                      const minPrice = Math.min(...prices)
                      const maxPrice = Math.max(...prices)
                      const range = maxPrice - minPrice
                      
                      // Add 10% padding on each side, but ensure we show fluctuations
                      // If range is very small, use a minimum range of 2% of the average price
                      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
                      const minRange = avgPrice * 0.02 // 2% minimum range
                      
                      const padding = Math.max(range * 0.1, minRange / 2)
                      
                      return [minPrice - padding, maxPrice + padding]
                    })()}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Predicted Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predictedPrice" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="XGBoost Prediction"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : selectedTicker ? (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-500">No predictions available for {selectedTicker}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Accuracy</span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold">
                {accuracy !== null ? `${accuracy.toFixed(1)}%` : 'N/A'}
              </p>
              {r2 !== null && (
                <p className="text-xs text-gray-500 mt-1">R²: {r2.toFixed(4)}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Confidence</span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold">{confidence}</p>
              {mse !== null && (
                <p className="text-xs text-gray-500 mt-1">MSE: {mse.toFixed(2)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

