"use client"
import React, { useState } from 'react'
import { X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { PortfolioHistoryPoint } from '@/components/enviro-compoents-real/Portfolio'

interface StockDetail {
  symbol: string
  company: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  avgVolume: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  peRatio: number
  sector: string
  chartData: Array<{ date: string; price: number }>
}

interface StockTradeModalProps {
  stock: StockDetail
  onClose: () => void
  timeframe: 'day' | 'month' | 'year' | 'all'
  setTimeframe: (timeframe: 'day' | 'month' | 'year' | 'all') => void
  fetchStockDetail: (symbol: string) => Promise<void>
  stockDetails: { [key: string]: StockDetail }

  // trading props
  cashBalance: number
  holdings: number
  onExecuteTrade: (action: 'Buy' | 'Sell', symbol: string, price: number, quantity: number) => void
}

export default function StockTradeModal({ stock, onClose, timeframe, setTimeframe, fetchStockDetail, cashBalance, holdings, onExecuteTrade }: StockTradeModalProps) {
  const [quantity, setQuantity] = useState<number>(0)
  const [action, setAction] = useState<'Buy' | 'Sell'>('Buy')
  const [error, setError] = useState<string | null>(null)

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M'
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K'
    return vol.toString()
  }

  const execute = () => {
    setError(null)
    const qty = Math.floor(quantity)
    if (qty <= 0) {
      setError('Enter a quantity greater than zero')
      return
    }
    const total = qty * stock.price
    if (action === 'Buy' && total > cashBalance) {
      setError('Insufficient cash for this purchase')
      return
    }
    if (action === 'Sell' && qty > holdings) {
      setError('You do not own enough shares to sell')
      return
    }

    onExecuteTrade(action, stock.symbol, stock.price, qty)
    setQuantity(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-0" onClick={onClose}>
      <button onClick={onClose} aria-label="Close" className="fixed right-4 top-4 z-60 p-2 rounded hover:bg-gray-100 bg-white/80 backdrop-blur-sm">
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex items-start justify-center min-h-screen p-8" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] p-8 relative overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-start justify-between pb-6 border-b">
              <div>
                <h2 className="text-5xl font-bold text-gray-900">{stock.symbol}</h2>
                <p className="text-xl text-gray-600 mt-2">{stock.company}</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-gray-900">${stock.price.toFixed(2)}</p>
                <p className={`text-2xl font-semibold mt-2 ${stock.change >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>

            <div className="w-full h-96 rounded-xl bg-gray-50 border-2 border-gray-200 overflow-hidden">
              {stock.chartData && stock.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stock.chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => { const date = new Date(value); return `${date.getMonth() + 1}/${date.getDate()}` }} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', padding: '10px' }} formatter={(value: any) => [`$${value}`, 'Price']} labelFormatter={(label) => `Date: ${label}`} />
                    <Line type="monotone" dataKey="price" stroke={stock.change >= 0 ? '#9DB38A' : '#c17b7b'} strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chart...</div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="col-span-2 space-y-4">
                <div className="flex gap-3 justify-center">
                  {['day', 'month', 'year', 'all'].map((tf) => (
                    <button key={tf} onClick={async (e) => { e.stopPropagation(); const newTimeframe = tf as 'day' | 'month' | 'year' | 'all'; setTimeframe(newTimeframe); await fetchStockDetail(stock.symbol) }} className={`py-3 px-6 rounded-lg text-base font-medium transition-colors ${timeframe === tf ? 'bg-[#9DB38A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Price Info</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-base"><span className="text-gray-600">Open:</span><span className="font-medium text-gray-900">${stock.open?.toFixed(2) || '-'}</span></div>
                      <div className="flex justify-between text-base"><span className="text-gray-600">High:</span><span className="font-medium text-gray-900">${stock.high?.toFixed(2) || '-'}</span></div>
                      <div className="flex justify-between text-base"><span className="text-gray-600">Low:</span><span className="font-medium text-gray-900">${stock.low?.toFixed(2) || '-'}</span></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Volume</p>
                    <p className="text-2xl font-bold text-gray-900">{stock.volume ? formatVolume(stock.volume) : '-'}</p>
                    <p className="text-sm text-gray-600 mt-1">Avg: {stock.avgVolume ? formatVolume(stock.avgVolume) : '-'}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="col-span-1 bg-gradient-to-br from-[#eff3eb] to-blue-50 rounded-xl p-5 border-2 border-[#9DB38A] flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700 uppercase mb-3">AI Signal</p>
                    <p className={`text-4xl font-bold mb-2 ${stock.changePercent >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>{stock.changePercent >= 0 ? 'BUY' : 'HOLD'}</p>
                    <p className="text-sm text-gray-600 mb-4">Confidence: {Math.min(Math.abs(stock.changePercent * 10), 99).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Price:</p>
                    <p className="text-xl font-bold text-gray-900">${(stock.price * (1 + Math.abs(stock.changePercent) / 100)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade area split into two rounded halves */}
            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
              <div className="bg-white rounded-xl p-4 border flex flex-col justify-center items-center">
                <p className="text-sm text-gray-600">Cash balance</p>
                <p className="text-2xl font-bold">${cashBalance.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-3">Your holdings</p>
                <p className="text-xl font-medium">{holdings} shares</p>
                <div className="mt-4 w-full text-center">
                  <p className="text-sm text-gray-500">Portfolio Value</p>
                  <p className="text-lg font-semibold">${(holdings * stock.price + cashBalance).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border flex flex-col items-center">
                <div className="w-full">
                  <h3 className="text-center text-lg font-semibold">Trade</h3>

                  <div className="flex justify-center gap-3 mt-3">
                    <button onClick={() => setAction('Buy')} className={`px-4 py-2 rounded ${action === 'Buy' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>Buy</button>
                    <button onClick={() => setAction('Sell')} className={`px-4 py-2 rounded ${action === 'Sell' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>Sell</button>
                  </div>

                  <div className="mt-4 flex flex-col items-center w-full">
                    <input type="number" value={quantity === 0 ? '' : quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="Quantity" className="w-40 border rounded px-3 py-2 text-center" />

                    <div className="text-sm text-gray-600 mt-2 text-center">Price: <span className="font-medium">${stock.price.toFixed(2)}</span></div>
                    <div className="text-sm text-gray-600 mt-1 text-center">Total: <span className="font-medium">${(quantity * stock.price).toFixed(2)}</span></div>
                  </div>

                  {error && <div className="mt-2 text-red-600 text-center">{error}</div>}

                  <div className="mt-4 w-full flex justify-center">
                    <button onClick={execute} className="bg-blue-600 text-white px-6 py-2 rounded-md">Execute</button>
                  </div>

                  <p className="mt-3 text-xs text-gray-500 text-center">Simulation only — this is not real financial advice or real stock trading.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
