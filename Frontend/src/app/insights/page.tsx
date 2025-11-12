'use client'

import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { NewsSection } from '@/components/dashboard/NewsSection'
import { IndexesSection } from '@/components/dashboard/IndexesSection'
import { TrendingUp, Lightbulb, Target } from 'lucide-react'

export default function InsightsPage() {
  const newsItems = [
    {
      title: "Fed Signals Potential Rate Cuts in Q2",
      source: "Reuters • 2 hours ago",
      text: "Federal Reserve officials indicated they may begin reducing interest rates as early as the second quarter, citing moderating inflation and stable employment data. This could boost equity markets, particularly growth stocks.",
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
      text: "Major technology companies reported better-than-expected quarterly results, driven by AI and cloud computing demand. Semiconductor stocks are particularly strong, with AI infrastructure investments driving growth.",
      stocks: [
        { symbol: "GOOGL", change: "+2.32%", positive: true },
        { symbol: "AMZN", change: "-0.51%", positive: false },
        { symbol: "META", change: "-0.61%", positive: false }
      ]
    },
    {
      title: "Energy Sector Faces Headwinds",
      source: "Financial Times • 6 hours ago",
      text: "Oil prices declined amid concerns about global demand. Renewable energy stocks showed mixed performance as investors weigh policy changes and technological advances.",
      stocks: [
        { symbol: "XOM", change: "-1.20%", positive: false },
        { symbol: "ENPH", change: "+0.85%", positive: true }
      ]
    }
  ]

  const indexes = [
    { color: "bg-blue-500", name: "HealthThesis", description: "Overall stock market health indicator - Currently showing positive momentum" },
    { color: "bg-blue-600", name: "LongThesis", description: "Long-term market strength signal - Bullish trend detected" },
    { color: "bg-purple-500", name: "ShortThesis", description: "Short-term market momentum indicator - Moderate volatility expected" }
  ]

  // AI Recommendations based on market analysis
  const aiRecommendations = [
    {
      title: "Portfolio Diversification",
      description: "Based on current market conditions and your holdings, consider adding exposure to defensive sectors like utilities and consumer staples to balance tech-heavy positions.",
      icon: Target,
      priority: "High"
    },
    {
      title: "AI & Semiconductor Focus",
      description: "The AI infrastructure boom continues to drive semiconductor demand. Consider maintaining or increasing positions in leading AI chip manufacturers.",
      icon: TrendingUp,
      priority: "Medium"
    },
    {
      title: "Interest Rate Sensitivity",
      description: "With potential rate cuts on the horizon, growth stocks may benefit. However, monitor inflation data closely as policy changes could be delayed.",
      icon: Lightbulb,
      priority: "Medium"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="Insights"
          description="AI-powered market analysis and stock recommendations"
        />
        
        {/* AI Recommendations Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">AI-Powered Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiRecommendations.map((rec, index) => {
              const Icon = rec.icon
              return (
                <Card key={index} className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-600' :
                        rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Market News & Signals */}
        <div className="mb-6">
          <NewsSection 
            newsItems={newsItems}
            className="rounded-2xl"
          />
        </div>

        {/* Fundthesis Indexes */}
        <div className="mb-6">
          <IndexesSection 
            indexes={indexes}
            className="rounded-2xl"
          />
        </div>

        {/* Market Analysis Summary */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Market Analysis Summary</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">Current Market Outlook</h3>
                <p className="text-sm text-gray-700">
                  The market is showing positive momentum with technology and AI-related stocks leading gains. 
                  The HealthThesis indicator suggests overall market health is strong, while LongThesis signals 
                  a bullish long-term trend. Short-term volatility (ShortThesis) remains moderate, indicating 
                  potential for continued growth with manageable risk.
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">Key Opportunities</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>AI infrastructure and semiconductor stocks showing strong momentum</li>
                  <li>Potential rate cuts could benefit growth-oriented portfolios</li>
                  <li>Tech sector earnings exceeding expectations</li>
                </ul>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">Risk Considerations</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Monitor inflation data for potential policy changes</li>
                  <li>Energy sector facing headwinds from demand concerns</li>
                  <li>Consider portfolio rebalancing to manage concentration risk</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    
    </div>
  )
}