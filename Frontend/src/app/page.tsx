import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'

export default function HomePage() {
  const features = [
    {
      title: "Real-time Analysis",
      description: "Get instant insights on market trends and stock performance."
    },
    {
      title: "Portfolio Optimization",
      description: "AI-driven recommendations for portfolio diversification."
    },
    {
      title: "Educational Resources",
      description: "Learn investing fundamentals with our comprehensive guides."
    }
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <PageHeader 
          title="Welcome to Fundthesis"
          description="AI-Powered Financial Education Platform"
        />
        <p className="text-lg text-gray-500 max-w-3xl mx-auto">
          Empowering first-time and seasoned retail investors with real-time news 
          summarization and AI-powered stock analysis for portfolio diversification.
        </p>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardContent>
              <CardTitle className="mb-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}