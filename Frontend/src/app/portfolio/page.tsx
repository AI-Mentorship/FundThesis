import React from 'react'
import PageLayout from '@/components/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { PortfolioTable } from '@/components/ui/PortfolioTable'

export default function PortfolioPage() {
  const holdings = [
    {
      symbol: "AAPL",
      shares: 50,
      price: "$175.43",
      value: "$8,771.50",
      gainLoss: "+$421.50",
      isPositive: true
    },
    {
      symbol: "MSFT",
      shares: 25,
      price: "$378.85",
      value: "$9,471.25",
      gainLoss: "+$612.80",
      isPositive: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="Portfolio"
          description="Manage and optimize your investment portfolio"
        />
        
        <PortfolioTable holdings={holdings} />
      </main>
      
    </div>
  )
}