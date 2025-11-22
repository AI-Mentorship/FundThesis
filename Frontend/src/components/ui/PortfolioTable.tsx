import React from 'react'

interface Holding {
  symbol: string
  shares: number
  price: string
  value: string
  gainLoss: string
  isPositive: boolean
}

interface PortfolioTableProps {
  holdings: Holding[]
  className?: string
}

export function PortfolioTable({ holdings, className = "" }: PortfolioTableProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">Your Holdings</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gain/Loss
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.map((holding, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {holding.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {holding.shares}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {holding.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {holding.value}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${holding.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.gainLoss}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

