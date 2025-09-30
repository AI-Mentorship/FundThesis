import React from 'react'
import Navbar from '@/components/Navbar'
import StockTicker from '@/components/StockTicker'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <StockTicker />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Portfolio</h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage and optimize your investment portfolio
        </p>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Your Holdings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">AAPL</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">50</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">$175.43</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">$8,771.50</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">+$421.50</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">MSFT</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">25</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">$378.85</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">$9,471.25</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">+$612.80</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}