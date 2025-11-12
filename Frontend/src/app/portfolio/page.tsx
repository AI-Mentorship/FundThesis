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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader 
          title="Portfolio"
          description="Manage and optimize your investment portfolio"
        />
        
        <PortfolioTable holdings={holdings} />
      </main>
      
    </div>
  )
}