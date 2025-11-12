import React from 'react'
import PageLayout from '@/components/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'

export default function InsightsPage() {
  const insights = [
    {
      title: "Market Summary",
      description: "Markets showed positive momentum today with tech stocks leading the gains. AI and semiconductor sectors continue to attract investor attention."
    },
    {
      title: "AI Recommendations",
      description: "Based on your portfolio and risk profile, consider diversifying into emerging markets and renewable energy sectors."
    },
    {
      title: "News Highlights",
      description: "Latest financial news and market-moving events will be summarized here using our AI-powered news aggregation system."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="Insights"
          description="AI-powered market analysis and stock recommendations"
        />
        
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardContent>
                <CardTitle className="mb-2">{insight.title}</CardTitle>
                <CardDescription>{insight.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    
    </div>
  )
}