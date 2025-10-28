import React from 'react'
import PageLayout from '@/components/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'
import { ESGCard } from '@/components/ui/ESGCard'

export default function EnviroPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="EnviroThesis"
          description="Invest in a sustainable future with ESG-focused opportunities"
        />
        
        <div className="space-y-6">
          <Card>
            <CardContent>
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

          <Card>
            <CardContent>
              <CardTitle className="mb-4">Top ESG Stocks</CardTitle>
              <CardDescription>
                Discover companies leading the way in sustainable business practices and 
                environmental responsibility. Our AI analyzes ESG ratings and performance metrics 
                to identify the best sustainable investment opportunities.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}