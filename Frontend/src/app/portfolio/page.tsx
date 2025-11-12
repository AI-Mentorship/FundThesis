'use client'

import React, { useEffect, useState } from 'react'
import PageLayout from '@/components/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { PortfolioTable } from '@/components/ui/PortfolioTable'
import { getCurrentUser } from '@/lib/supabaseClient'
import { getUserTickers } from '@/lib/tickerService'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Holding {
  symbol: string
  shares: number
  price: string
  value: string
  gainLoss: string
  isPositive: boolean
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          setLoading(false)
          return
        }

        const userTickers = await getUserTickers(user.id)
        if (userTickers.length === 0) {
          setHoldings([])
          setLoading(false)
          return
        }

        const tickerSymbols = userTickers.map(t => t.stock_ticker)

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

        // Map API data to holdings format
        // For demo purposes, we'll use a default of 10 shares per ticker
        // In a real app, you'd store shares in the database
        const mappedHoldings: Holding[] = data.tickers.map((ticker: any) => {
          const shares = 10 // Default shares - in real app, get from database
          const currentPrice = ticker.currentPrice
          const value = shares * currentPrice
          
          // Calculate gain/loss based on monthly gain
          const monthlyGainPercent = ticker.monthlyGain / 100
          const previousValue = value / (1 + monthlyGainPercent)
          const gainLoss = value - previousValue

          return {
            symbol: ticker.ticker,
            shares: shares,
            price: `$${currentPrice.toFixed(2)}`,
            value: `$${value.toFixed(2)}`,
            gainLoss: `${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)}`,
            isPositive: gainLoss >= 0
          }
        })

        setHoldings(mappedHoldings)
      } catch (error) {
        console.error('Error loading portfolio:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <PageHeader 
            title="Portfolio"
            description="Manage and optimize your investment portfolio"
          />
          <div className="text-center py-12 text-gray-600">Loading portfolio...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="Portfolio"
          description="Manage and optimize your investment portfolio"
        />
        
        {holdings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No holdings found.</p>
            <p className="text-sm text-gray-500">Add tickers to your dashboard to see them here.</p>
          </div>
        ) : (
          <PortfolioTable holdings={holdings} />
        )}
      </main>
      
    </div>
  )
}