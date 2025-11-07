import React from 'react'
import Navbar from '@/components/Navbar'
import StockTicker from '@/components/StockTicker'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <StockTicker />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Value</h3>
            <p className="text-3xl font-bold text-green-600">$48,392.50</p>
            <p className="text-sm text-gray-500 mt-1">+2.3% today</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Gain/Loss</h3>
            <p className="text-3xl font-bold text-green-600">+$3,241.18</p>
            <p className="text-sm text-gray-500 mt-1">+7.2% all time</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Holdings</h3>
            <p className="text-3xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-500 mt-1">Active positions</p>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">Your recent transactions and portfolio updates will appear here.</p>
        </div>
      </main>
    </div>
  )
}
