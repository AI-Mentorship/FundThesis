'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { StatsCard } from '@/components/ui/StatsCard'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getCurrentUser } from '@/lib/supabaseClient'
import { getUserTickers } from '@/lib/tickerService'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface PortfolioOverviewProps {
  className?: string
}

interface ChartDataPoint {
  date: string
  [key: string]: string | number
}

export function PortfolioOverview({ className = "" }: PortfolioOverviewProps) {
  const [loading, setLoading] = useState(true)
  const [dailyGain, setDailyGain] = useState(0)
  const [weeklyGain, setWeeklyGain] = useState(0)
  const [monthlyGain, setMonthlyGain] = useState(0)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    async function loadPortfolioData() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          setLoading(false)
          return
        }

        const userTickers = await getUserTickers(user.id)
        const tickerSymbols = userTickers.map(t => t.stock_ticker)

        if (tickerSymbols.length === 0) {
          setLoading(false)
          return
        }

        // Fetch portfolio data from API
        const response = await fetch(`${API_URL}/api/portfolio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tickers: tickerSymbols }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data')
        }

        const data = await response.json()

        // Set gains
        setDailyGain(data.aggregateGains?.daily || 0)
        setWeeklyGain(data.aggregateGains?.weekly || 0)
        setMonthlyGain(data.aggregateGains?.monthly || 0)

        // Process chart data - group by date and aggregate prices
        const chartMap: { [date: string]: { date: string; [ticker: string]: number } } = {}
        
        data.chartData?.forEach((point: { date: string; ticker: string; price: number }) => {
          if (!chartMap[point.date]) {
            chartMap[point.date] = { date: point.date }
          }
          chartMap[point.date][point.ticker] = point.price
        })

        // Convert to array and calculate average price
        const chartArray = Object.values(chartMap)
          .map(item => {
            const tickers = Object.keys(item).filter(k => k !== 'date')
            const prices = tickers.map(t => item[t] as number).filter(p => !isNaN(p))
            const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
            
            return {
              ...item,
              average: avgPrice
            }
          })
          .sort((a, b) => a.date.localeCompare(b.date))

        setChartData(chartArray)
      } catch (error) {
        console.error('Error loading portfolio data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolioData()
  }, [])

  const stats = [
    {
      label: "Daily Gain",
      value: `${dailyGain >= 0 ? '+' : ''}${dailyGain.toFixed(2)}%`,
      description: "Change since last market close",
      positive: dailyGain >= 0,
      icon: dailyGain >= 0 ? TrendingUp : TrendingDown
    },
    {
      label: "Weekly Gain",
      value: `${weeklyGain >= 0 ? '+' : ''}${weeklyGain.toFixed(2)}%`,
      description: "Performance over past 7 days",
      positive: weeklyGain >= 0,
      icon: weeklyGain >= 0 ? TrendingUp : TrendingDown
    },
    {
      label: "Monthly Gain",
      value: `${monthlyGain >= 0 ? '+' : ''}${monthlyGain.toFixed(2)}%`,
      description: "Performance over past 30 days",
      positive: monthlyGain >= 0,
      icon: monthlyGain >= 0 ? TrendingUp : TrendingDown
    }
  ]

  if (loading) {
    return (
      <>
        <Card className="rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-bold mb-3">Portfolio Value</h2>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Loading portfolio data...</p>
            </div>
          </CardContent>
        </Card>
        <Card className={className}>
          <CardContent>
            <h2 className="text-xl font-bold mb-3">Portfolio Overview</h2>
            <div className="text-gray-600">Loading...</div>
          </CardContent>
        </Card>
      </>
    )
  }

  // Calculate Y-axis domain to show price fluctuations better
  const getYAxisDomain = () => {
    if (chartData.length === 0) return ['auto', 'auto']
    
    const prices = chartData
      .map(d => d.average as number)
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
  }

  const yAxisDomain = getYAxisDomain()

  return (
    <>
      {/* Chart Card - Left Side */}
      <Card className="rounded-2xl">
        <CardContent>
          <h2 className="text-xl font-bold mb-3">Portfolio Value</h2>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                    domain={yAxisDomain}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Portfolio Average"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Add tickers to see portfolio chart</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Card - Right Side */}
      <Card className={className}>
        <CardContent>
          <h2 className="text-xl font-bold mb-3">Portfolio Overview</h2>
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
    </>
  )
}

