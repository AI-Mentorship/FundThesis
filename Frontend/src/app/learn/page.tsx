"use client"
import React from 'react'
import PageLayout from '@/components/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { LearningCard } from '@/components/ui/LearningCard'

export default function LearnPage() {
  const learningModules = [
    {
      title: "Beginner's Guide",
      description: "Start your investment journey with the basics of stocks, bonds, and market fundamentals."
    },
    {
      title: "Portfolio Strategy",
      description: "Learn how to build a diversified portfolio and manage risk effectively."
    },
    {
      title: "Technical Analysis",
      description: "Understand charts, indicators, and patterns to make informed trading decisions."
    },
    {
      title: "Fundamental Analysis",
      description: "Evaluate companies using financial statements, ratios, and market conditions."
    },
    {
      title: "Market Psychology",
      description: "Master the emotional aspects of investing and avoid common behavioral pitfalls."
    },
    {
      title: "Advanced Strategies",
      description: "Explore options, derivatives, and sophisticated investment techniques."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="LearnThesis"
          description="Master investing fundamentals with our comprehensive educational resources"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningModules.map((module, index) => (
            <LearningCard
              key={index}
              title={module.title}
              description={module.description}
              onStartLearning={() => console.log(`Starting ${module.title}`)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}