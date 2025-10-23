import React from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

export default function DashboardPage() {
  const newsItems = [
    {
      title: "Fed Signals Potential Rate Cuts in Q2",
      source: "Reuters • 2 hours ago",
      text: "Federal Reserve officials indicated they may begin reducing interest rates as early as the second quarter, citing moderating inflation and stable employment data.",
      stocks: [
        { symbol: "AAPL", change: "+1.41%", positive: true },
        { symbol: "MSFT", change: "-0.30%", positive: false },
        { symbol: "NVDA", change: "+1.45%", positive: true },
        { symbol: "TSLA", change: "+2.37%", positive: true }
      ]
    },
    {
      title: "Tech Sector Shows Strong Q4 Earnings",
      source: "Bloomberg • 4 hours ago",
      text: "Major technology companies reported better-than-expected quarterly results, driven by AI and cloud computing demand.",
      stocks: [
        { symbol: "GOOGL", change: "+2.32%", positive: true },
        { symbol: "AMZN", change: "-0.51%", positive: false },
        { symbol: "META", change: "-0.61%", positive: false }
      ]
    }
  ]

  const performers = [
    { rank: 1, symbol: "NVDA", name: "NVIDIA Corp.", price: "$875.40", change: "+12.50", percent: "+1.45%" },
    { rank: 2, symbol: "TSLA", name: "Tesla Inc.", price: "$248.50", change: "+5.75", percent: "+2.37%" },
    { rank: 3, symbol: "AAPL", name: "Apple Inc.", price: "$180.25", change: "+2.50", percent: "+1.41%" },
    { rank: 4, symbol: "GOOGL", name: "Alphabet Inc.", price: "$140.80", change: "+3.20", percent: "+2.32%" },
    { rank: 5, symbol: "JPM", name: "JPMorgan Chase", price: "$210.80", change: "+1.20", percent: "+0.57%" }
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="text-left mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Welcome back, Investor</h1>
        <p className="text-lg text-gray-600">Here's your financial overview for today</p>
      </div>

      {/* Portfolio Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
          <h2 className="text-xl font-bold mb-3">Portfolio Value</h2>
          <div className="h-64 bg-gray-50 rounded-lg"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
          <h2 className="text-xl font-bold mb-3">Portfolio Overview</h2>
          <div className="mb-4">
            <p className="text-4xl font-bold text-gray-600 mb-1">$125,000</p>
            <p className="text-sm text-gray-500">Total Portfolio Value</p>
          </div>
          
          {[
            { label: "Daily Gain", value: "+2.5%", desc: "Change since last market close", positive: true, icon: TrendingUp },
            { label: "Weekly Gain", value: "-1.2%", desc: "Performance over past 7 days", positive: false, icon: TrendingDown },
            { label: "Monthly Gain", value: "+8.7%", desc: "Performance over past 30 days", positive: true, icon: TrendingUp }
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className={`text-2xl font-bold mb-1 ${item.positive ? 'text-green-600' : 'text-red-600'}`}>{item.value}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* News & Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
          <h2 className="text-xl font-bold mb-3">Market News & Signals</h2>
          {newsItems.map((news, i) => (
            <div key={i} className={`${i < newsItems.length - 1 ? 'mb-4 pb-4 border-b' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{news.title}</h3>
                <span className="text-xs text-gray-500">{news.source}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{news.text}</p>
              <div className="flex flex-wrap gap-4">
                {news.stocks.map((stock, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stock.symbol}</span>
                    <span className={`text-sm ${stock.positive ? 'text-green-600' : 'text-red-600'}`}>{stock.change}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xl font-bold">Best Performers</h2>
          </div>
          <div className="space-y-3">
            {performers.map((p) => (
              <div key={p.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{p.rank}</span>
                  <div>
                    <p className="text-sm font-semibold">{p.symbol}</p>
                    <p className="text-xs text-gray-500">{p.name}</p>
                    <p className="text-xs text-gray-600">{p.price} <span className="text-green-600">{p.percent}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{p.price}</p>
                  <p className="text-xs text-green-600">{p.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indexes */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 mb-6">
        <h2 className="text-xl font-bold mb-4">Fundthesis Indexes</h2>
        <div className="h-64 bg-gray-50 rounded-lg mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { color: "bg-blue-500", name: "HealthThesis", desc: "Overall stock market health indicator" },
            { color: "bg-blue-600", name: "LongThesis", desc: "Long-term market strength signal" },
            { color: "bg-purple-500", name: "ShortThesis", desc: "Short-term market momentum indicator" }
          ].map((index, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${index.color}`}></div>
              <div>
                <p className="text-sm font-semibold">{index.name}</p>
                <p className="text-xs text-gray-500">{index.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Models */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Technical Models Explorer</h2>
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {["Time-Series Forecast", "XGBoost Signal", "Event-Based Model"].map((model, i) => (
              <button key={i} className={`py-2 px-4 rounded-lg text-sm font-medium ${i === 0 ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                {model}
              </button>
            ))}
          </div>
          <div className="h-64 bg-gray-50 rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Accuracy</span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold">87.2%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Confidence</span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold">High</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
