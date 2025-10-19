import React from 'react'
import Navbar from '@/components/Navbar'
import StockTicker from '@/components/StockTicker'

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <StockTicker />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Insights</h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered market analysis and stock recommendations
        </p>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Summary</h3>
            <p className="text-gray-600">
              Markets showed positive momentum today with tech stocks leading the gains. 
              AI and semiconductor sectors continue to attract investor attention.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Recommendations</h3>
            <p className="text-gray-600">
              Based on your portfolio and risk profile, consider diversifying into 
              emerging markets and renewable energy sectors.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">News Highlights</h3>
            <p className="text-gray-600">
              Latest financial news and market-moving events will be summarized here 
              using our AI-powered news aggregation system.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}