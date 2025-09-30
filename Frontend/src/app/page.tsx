import React from 'react'
import Navbar from '@/components/Navbar'
import StockTicker from '@/components/StockTicker'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Stock Ticker */}
      <StockTicker />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Fundthesis
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Financial Education Platform
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Empowering first-time and seasoned retail investors with real-time news 
            summarization and AI-powered stock analysis for portfolio diversification.
          </p>
        </div>
        
        {/* Placeholder for future content */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analysis</h3>
            <p className="text-gray-600">Get instant insights on market trends and stock performance.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Optimization</h3>
            <p className="text-gray-600">AI-driven recommendations for portfolio diversification.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Resources</h3>
            <p className="text-gray-600">Learn investing fundamentals with our comprehensive guides.</p>
          </div>
        </div>
      </main>
    </div>
  )
}