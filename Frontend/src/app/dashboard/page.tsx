import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview'
import { NewsSection } from '@/components/dashboard/NewsSection'
import { PerformersSection } from '@/components/dashboard/PerformersSection'
import { IndexesSection } from '@/components/dashboard/IndexesSection'
import { TechnicalModelsSection } from '@/components/dashboard/TechnicalModelsSection'
import { UserTickersSection } from '@/components/dashboard/UserTickersSection'

export default function DashboardPage() {
  const newsItems = [
    {
      title: "Fed Signals Potential Rate Cuts in Q2",
      source: "Reuters • 2 hours ago",
      text: "Federal Reserve officials indicated they may begin reducing interest rates as early as the second quarter, citing moderating inflation and stable employment data.",
      stocks: [
        { symbol: "AAPL", change: "+1.41%", positive: true },
        { symbol: "MSFT", change: "-0.30%", positive: false },
        { symbol: "NVDA", change: "+1.45%", positive: true },
        { symbol: "TSLA", change: "+2.37%", positive: true }
      ]
    },
    {
      title: "Tech Sector Shows Strong Q4 Earnings",
      source: "Bloomberg • 4 hours ago",
      text: "Major technology companies reported better-than-expected quarterly results, driven by AI and cloud computing demand.",
      stocks: [
        { symbol: "GOOGL", change: "+2.32%", positive: true },
        { symbol: "AMZN", change: "-0.51%", positive: false },
        { symbol: "META", change: "-0.61%", positive: false }
      ]
    }
  ]

  const performers = [
    { rank: 1, symbol: "NVDA", name: "NVIDIA Corp.", price: "$875.40", change: "+12.50", percent: "+1.45%" },
    { rank: 2, symbol: "TSLA", name: "Tesla Inc.", price: "$248.50", change: "+5.75", percent: "+2.37%" },
    { rank: 3, symbol: "AAPL", name: "Apple Inc.", price: "$180.25", change: "+2.50", percent: "+1.41%" },
    { rank: 4, symbol: "GOOGL", name: "Alphabet Inc.", price: "$140.80", change: "+3.20", percent: "+2.32%" },
    { rank: 5, symbol: "JPM", name: "JPMorgan Chase", price: "$210.80", change: "+1.20", percent: "+0.57%" }
  ]


  const indexes = [
    { color: "bg-blue-500", name: "HealthThesis", description: "Overall stock market health indicator" },
    { color: "bg-blue-600", name: "LongThesis", description: "Long-term market strength signal" },
    { color: "bg-purple-500", name: "ShortThesis", description: "Short-term market momentum indicator" }
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <PageHeader 
        title="Welcome back, Investor" 
        description="Here's your financial overview for today" 
        className="text-left"
      />

      {/* Portfolio Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PortfolioOverview />
      </div>

      {/* News & Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <NewsSection 
          newsItems={newsItems}
          className="lg:col-span-2 rounded-2xl"
        />

        <PerformersSection 
          performers={performers}
          className="rounded-2xl"
        />
      </div>

      {/* Indexes */}
      <IndexesSection 
        indexes={indexes}
        className="mb-6 rounded-2xl"
      />

      {/* Technical Models */}
      <TechnicalModelsSection className="mb-6" />

      {/* User Tickers Section */}
      <UserTickersSection />
    </main>
  )
}
