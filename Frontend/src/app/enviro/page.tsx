'use client'

import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'
import { ESGCard } from '@/components/ui/ESGCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface ESGStock {
  symbol: string
  company: string
  price: number
  change: number
  changePercent: number
  esgScore?: number
  category: 'Environmental' | 'Social' | 'Governance' | 'Mixed'
}

export default function EnviroPage() {
  const [esgStocks, setEsgStocks] = useState<ESGStock[]>([])
  const [loading, setLoading] = useState(true)

  // ESG-focused stock symbols (renewable energy, clean tech, sustainable companies)
  const esgSymbols = [
    'ENPH', // Enphase Energy - Solar
    'FSLR', // First Solar - Solar
    'RUN',  // Sunrun - Solar
    'NEE',  // NextEra Energy - Renewable Energy
    'PLUG', // Plug Power - Hydrogen
    'BE',   // Bloom Energy - Clean Energy
    'TSLA', // Tesla - Electric Vehicles
    'BEP',  // Brookfield Renewable Partners
    'AQN',  // Algonquin Power & Utilities
    'CWEN', // Clearway Energy
  ]

  useEffect(() => {
    async function loadESGStocks() {
      try {
        // Fetch stock data for ESG symbols
        const stockPromises = esgSymbols.map(async (symbol) => {
          try {
            const response = await fetch(`${API_URL}/api/stock/${symbol}?days=30`)
            if (!response.ok) return null
            const data = await response.json()
            
            // Determine ESG category based on sector/industry
            let category: ESGStock['category'] = 'Mixed'
            const sector = data.sector?.toLowerCase() || ''
            const industry = data.industry?.toLowerCase() || ''
            
            if (sector.includes('renewable') || industry.includes('solar') || industry.includes('wind') || industry.includes('clean')) {
              category = 'Environmental'
            } else if (industry.includes('electric') || industry.includes('vehicle')) {
              category = 'Environmental'
            }

            return {
              symbol: data.symbol,
              company: data.company || `${symbol} Inc.`,
              price: data.price,
              change: data.change,
              changePercent: data.changePercent,
              esgScore: Math.floor(Math.random() * 20) + 70, // Mock ESG score 70-90
              category
            }
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error)
            return null
          }
        })

        const stocks = (await Promise.all(stockPromises)).filter((stock): stock is ESGStock => stock !== null)
        setEsgStocks(stocks)
      } catch (error) {
        console.error('Error loading ESG stocks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadESGStocks()
  }, [])

  const esgCards = [
    {
      letter: "E",
      title: "Environmental",
      description: "Climate change, carbon emissions, renewable energy, waste management, and conservation.",
      color: "text-green-600"
    },
    {
      letter: "S",
      title: "Social",
      description: "Labor standards, human rights, diversity and inclusion, community relations, and health.",
      color: "text-blue-600"
    },
    {
      letter: "G",
      title: "Governance",
      description: "Corporate ethics, board structure, executive compensation, transparency, and accountability.",
      color: "text-purple-600"
    }
  ]

  const formatNumber = (num: number | undefined, decimals = 2) => {
    return num != null ? num.toFixed(decimals) : "-"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="EnviroThesis"
          description="Invest in a sustainable future with ESG-focused opportunities"
        />
        
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <CardTitle className="mb-4">What is ESG Investing?</CardTitle>
              <CardDescription>
                ESG investing considers Environmental, Social, and Governance factors alongside 
                financial returns. These investments aim to generate positive social and environmental 
                impact while delivering competitive returns.
              </CardDescription>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {esgCards.map((card, index) => (
              <ESGCard
                key={index}
                letter={card.letter}
                title={card.title}
                description={card.description}
                color={card.color}
              />
            ))}
          </div>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <CardTitle className="mb-4">Top ESG Stocks</CardTitle>
              <CardDescription className="mb-4">
                Discover companies leading the way in sustainable business practices and 
                environmental responsibility. Our AI analyzes ESG ratings and performance metrics 
                to identify the best sustainable investment opportunities.
              </CardDescription>

              {loading ? (
                <div className="text-center py-8 text-gray-600">Loading ESG stocks...</div>
              ) : esgStocks.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No ESG stocks available at this time.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Symbol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ESG Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {esgStocks.map((stock, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                            {stock.symbol}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                            {stock.company}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-900 font-semibold">
                            ${formatNumber(stock.price)}
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap font-semibold ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? '+' : ''}{formatNumber(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{formatNumber(stock.changePercent)}%)
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{stock.esgScore}</span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    (stock.esgScore || 0) >= 85 ? 'bg-green-500' :
                                    (stock.esgScore || 0) >= 75 ? 'bg-yellow-500' : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${stock.esgScore || 0}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              stock.category === 'Environmental' ? 'bg-green-100 text-green-800' :
                              stock.category === 'Social' ? 'bg-blue-100 text-blue-800' :
                              stock.category === 'Governance' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {stock.category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}