'use client'

import React from 'react'
import Navbar from '@/components/Navbar'
import StockTicker from '@/components/StockTicker'
import { StockCardStack } from '@/components/StockCard'

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <StockTicker />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Discover Stocks</h1>
        <p className="text-xl text-gray-600 mb-16 text-center">
          Explore trending stocks with our interactive card viewer
        </p>

        {/* Card Stack */}
        <div className="py-12">
          <StockCardStack />
        </div>
      </main>
    </div>
  )
}
