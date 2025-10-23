import React from 'react'
import PageLayout from '@/components/PageLayout'

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gray-50">
     
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">LearnThesis</h1>
        <p className="text-xl text-gray-600 mb-8">
          Master investing fundamentals with our comprehensive educational resources
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Beginner's Guide</h3>
            <p className="text-gray-600 mb-4">
              Start your investment journey with the basics of stocks, bonds, and market fundamentals.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">Start Learning →</button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Strategy</h3>
            <p className="text-gray-600 mb-4">
              Learn how to build a diversified portfolio and manage risk effectively.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">Start Learning →</button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Analysis</h3>
            <p className="text-gray-600 mb-4">
              Understand charts, indicators, and patterns to make informed trading decisions.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">Start Learning →</button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fundamental Analysis</h3>
            <p className="text-gray-600 mb-4">
              Evaluate companies using financial statements, ratios, and market conditions.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">Start Learning →</button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Psychology</h3>
            <p className="text-gray-600 mb-4">
              Master the emotional aspects of investing and avoid common behavioral pitfalls.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">Start Learning →</button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Strategies</h3>
            <p className="text-gray-600 mb-4">
              Explore options, derivatives, and sophisticated investment techniques.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">Start Learning →</button>
          </div>
        </div>
      </main>
      
    </div>
  )
}