'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, PieChart, DollarSign } from 'lucide-react'

interface PortfolioStock {
  id: string
  symbol: string
  company: string
  shares: number
  avgCost: number
  currentPrice: number
  totalValue: number
  totalCost: number
  gainLoss: number
  gainLossPercent: number
}

export default function PortfolioPage() {
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>([
    {
      id: '1',
      symbol: 'AAPL',
      company: 'Apple Inc.',
      shares: 50,
      avgCost: 150.00,
      currentPrice: 178.50,
      totalValue: 8925.00,
      totalCost: 7500.00,
      gainLoss: 1425.00,
      gainLossPercent: 19.00
    },
    {
      id: '2',
      symbol: 'MSFT',
      company: 'Microsoft Corp.',
      shares: 25,
      avgCost: 380.00,
      currentPrice: 420.15,
      totalValue: 10503.75,
      totalCost: 9500.00,
      gainLoss: 1003.75,
      gainLossPercent: 10.57
    }
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStock, setEditingStock] = useState<PortfolioStock | null>(null)
  const [formData, setFormData] = useState({
    symbol: '',
    company: '',
    shares: '',
    avgCost: ''
  })

  const totalPortfolioValue = portfolioStocks.reduce((sum, stock) => sum + stock.totalValue, 0)
  const totalPortfolioCost = portfolioStocks.reduce((sum, stock) => sum + stock.totalCost, 0)
  const totalGainLoss = totalPortfolioValue - totalPortfolioCost
  const totalGainLossPercent = (totalGainLoss / totalPortfolioCost) * 100

  const handleAddStock = () => {
    const shares = parseFloat(formData.shares)
    const avgCost = parseFloat(formData.avgCost)
    const currentPrice = avgCost * 1.1 // Mock current price
    const totalCost = shares * avgCost
    const totalValue = shares * currentPrice
    const gainLoss = totalValue - totalCost
    const gainLossPercent = (gainLoss / totalCost) * 100

    const newStock: PortfolioStock = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      company: formData.company,
      shares,
      avgCost,
      currentPrice,
      totalValue,
      totalCost,
      gainLoss,
      gainLossPercent
    }

    setPortfolioStocks([...portfolioStocks, newStock])
    setShowAddModal(false)
    setFormData({ symbol: '', company: '', shares: '', avgCost: '' })
  }

  const handleEditStock = () => {
    if (!editingStock) return

    const shares = parseFloat(formData.shares)
    const avgCost = parseFloat(formData.avgCost)
    const totalCost = shares * avgCost
    const totalValue = shares * editingStock.currentPrice
    const gainLoss = totalValue - totalCost
    const gainLossPercent = (gainLoss / totalCost) * 100

    setPortfolioStocks(portfolioStocks.map(stock =>
      stock.id === editingStock.id
        ? { ...stock, shares, avgCost, totalCost, totalValue, gainLoss, gainLossPercent }
        : stock
    ))
    setEditingStock(null)
    setFormData({ symbol: '', company: '', shares: '', avgCost: '' })
  }

  const handleDeleteStock = (id: string) => {
    setPortfolioStocks(portfolioStocks.filter(stock => stock.id !== id))
  }

  const openEditModal = (stock: PortfolioStock) => {
    setEditingStock(stock)
    setFormData({
      symbol: stock.symbol,
      company: stock.company,
      shares: stock.shares.toString(),
      avgCost: stock.avgCost.toString()
    })
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Portfolio</h1>
          <p className="text-lg text-gray-600">Track and manage your stock holdings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#9DB38A] text-white rounded-lg hover:bg-[#8ca379] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Stock
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <p className="text-sm text-gray-600">Total Value</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <p className="text-sm text-gray-600">Total Cost</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalPortfolioCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            {totalGainLoss >= 0 ? <TrendingUp className="w-5 h-5 text-[#9DB38A]" /> : <TrendingDown className="w-5 h-5 text-[#c17b7b]" />}
            <p className="text-sm text-gray-600">Total Gain/Loss</p>
          </div>
          <p className={`text-3xl font-bold ${totalGainLoss >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>
            {totalGainLoss >= 0 ? '+' : ''}${Math.abs(totalGainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-gray-400" />
            <p className="text-sm text-gray-600">Return</p>
          </div>
          <p className={`text-3xl font-bold ${totalGainLossPercent >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>
            {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Holdings</h2>
        </div>

        {portfolioStocks.length === 0 ? (
          <div className="p-12 text-center">
            <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No stocks in your portfolio yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#9DB38A] text-white rounded-lg hover:bg-[#8ca379] transition-colors"
            >
              Add Your First Stock
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shares</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gain/Loss</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Return %</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolioStocks.map(stock => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{stock.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stock.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{stock.shares}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">${stock.avgCost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">${stock.currentPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">${stock.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${stock.gainLoss >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>
                      {stock.gainLoss >= 0 ? '+' : ''}${stock.gainLoss.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${stock.gainLossPercent >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>
                      {stock.gainLossPercent >= 0 ? '+' : ''}{stock.gainLossPercent.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(stock)}
                          className="p-2 text-gray-400 hover:text-[#9DB38A] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStock(stock.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingStock) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowAddModal(false); setEditingStock(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingStock ? 'Edit Stock' : 'Add Stock'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="AAPL"
                  disabled={!!editingStock}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DB38A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Apple Inc."
                  disabled={!!editingStock}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DB38A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Shares</label>
                <input
                  type="number"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                  placeholder="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DB38A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Cost per Share</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.avgCost}
                  onChange={(e) => setFormData({ ...formData, avgCost: e.target.value })}
                  placeholder="150.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DB38A] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setEditingStock(null); setFormData({ symbol: '', company: '', shares: '', avgCost: '' }); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingStock ? handleEditStock : handleAddStock}
                disabled={!formData.symbol || !formData.shares || !formData.avgCost || (!editingStock && !formData.company)}
                className="flex-1 px-4 py-2 bg-[#9DB38A] text-white rounded-lg hover:bg-[#8ca379] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingStock ? 'Save Changes' : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}