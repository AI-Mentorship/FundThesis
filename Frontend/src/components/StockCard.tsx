'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Stock {
  symbol: string
  company: string
  price: number
  change: number
  changePercent: number
}

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

interface StockCardStackProps {
  stocks: Stock[]
  stockDetails: { [key: string]: StockDetail }
  currentIndex: number
  setCurrentIndex: (index: number) => void
  timeframe: 'day' | 'month' | 'year'
  setTimeframe: (timeframe: 'day' | 'month' | 'year') => void
  loadingMore: boolean
  checkAndLoadMore: (index: number) => void
  fetchStockDetail: (symbol: string) => Promise<void>
}

export function StockCardStack({
  stocks,
  stockDetails,
  currentIndex,
  setCurrentIndex,
  timeframe,
  setTimeframe,
  loadingMore,
  checkAndLoadMore,
  fetchStockDetail
}: StockCardStackProps) {
  const [expandedStock, setExpandedStock] = useState<StockDetail | null>(null)

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + stocks.length) % stocks.length
    setCurrentIndex(newIndex)
    checkAndLoadMore(newIndex)
  }

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % stocks.length
    setCurrentIndex(newIndex)
    checkAndLoadMore(newIndex)
  }

  const handleCardClick = (stock: Stock, index: number) => {
    if (index === currentIndex) {
      const detail = stockDetails[stock.symbol]
      if (detail) {
        setExpandedStock(detail)
      }
    } else {
      setCurrentIndex(index)
    }
  }

  const closeExpanded = () => {
    setExpandedStock(null)
  }

  const getCardStyle = (stockIndex: number) => {
    let relativePosition = stockIndex - currentIndex
    
    if (relativePosition > stocks.length / 2) {
      relativePosition -= stocks.length
    } else if (relativePosition < -stocks.length / 2) {
      relativePosition += stocks.length
    }

    const distance = Math.abs(relativePosition)
    
    if (distance === 0) {
      return { transform: 'translateX(0) scale(1)', zIndex: 30, filter: 'blur(0px)', opacity: 1 }
    } else if (distance === 1) {
      return { transform: `translateX(${relativePosition > 0 ? '180px' : '-180px'}) scale(0.85)`, zIndex: 20, filter: 'blur(2px)', opacity: 0.6 }
    } else if (distance === 2) {
      return { transform: `translateX(${relativePosition > 0 ? '300px' : '-300px'}) scale(0.7)`, zIndex: 10, filter: 'blur(4px)', opacity: 0.3 }
    } else {
      return { transform: `translateX(${relativePosition > 0 ? '400px' : '-400px'}) scale(0.6)`, zIndex: 1, filter: 'blur(6px)', opacity: 0 }
    }
  }

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M'
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K'
    return vol.toString()
  }

  if (stocks.length === 0) {
    return <div className="flex items-center justify-center h-auto py-20"><div className="text-gray-600">No stocks available</div></div>
  }

  const currentStock = stocks[currentIndex]
  const currentDetail = stockDetails[currentStock?.symbol]

  return (
    <>
      <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto px-8">
        <button onClick={goToPrevious} className="absolute left-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group">
          <ChevronLeft className="w-6 h-6 text-gray-900 group-hover:text-[#9DB38A] transition-colors" />
        </button>

        <div className="relative w-full min-h-[950px] flex items-center justify-center py-8">
          {stocks.map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="absolute w-full max-w-[650px] min-h-[900px] transition-all duration-500 ease-out cursor-pointer" style={getCardStyle(index)} onClick={() => handleCardClick(stock, index)}>
              <div className="w-full h-full rounded-lg bg-white shadow-sm p-6 flex flex-col gap-4 border border-gray-200 hover:border-[#9DB38A] transition-all duration-300">
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-gray-900 text-3xl font-bold">{stock.symbol}</h3>
                    <p className="text-gray-600 text-sm mt-1">{stock.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 text-3xl font-bold">${stock.price.toFixed(2)}</p>
                    <p className={`text-lg font-semibold ${stock.change >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-full h-64 rounded-lg bg-gray-50 border-2 border-gray-200 overflow-hidden">
                    {currentDetail?.chartData && index === currentIndex ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentDetail.chartData}>
                          <XAxis dataKey="date" tick={false} axisLine={false} />
                          <YAxis domain={['auto', 'auto']} tick={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} formatter={(value: any) => [`$${value}`, 'Price']} />
                          <Line type="monotone" dataKey="price" stroke={stock.change >= 0 ? '#9DB38A' : '#c17b7b'} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">{index === currentIndex ? 'Loading chart...' : 'Chart'}</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {['day', 'month', 'year'].map((tf) => (
                    <button key={tf} onClick={(e) => { e.stopPropagation(); setTimeframe(tf as 'day' | 'month' | 'year') }} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${timeframe === tf ? 'bg-[#9DB38A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-3 h-[240px]">
                  <div className="col-span-2 grid grid-rows-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Price Info</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs"><span className="text-gray-600">Open:</span><span className="font-medium text-gray-900">${currentDetail?.open?.toFixed(2) || '-'}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-600">High:</span><span className="font-medium text-gray-900">${currentDetail?.high?.toFixed(2) || '-'}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-600">Low:</span><span className="font-medium text-gray-900">${currentDetail?.low?.toFixed(2) || '-'}</span></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Volume</p>
                      <p className="text-lg font-bold text-gray-900">{currentDetail?.volume ? formatVolume(currentDetail.volume) : '-'}</p>
                      <p className="text-xs text-gray-600">Avg: {currentDetail?.avgVolume ? formatVolume(currentDetail.avgVolume) : '-'}</p>
                    </div>
                  </div>

                  <div className="col-span-2 grid grid-rows-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">52W Range</p>
                      <p className="text-xs text-gray-900 font-medium">${currentDetail?.fiftyTwoWeekLow.toFixed(2) || '-'} - ${currentDetail?.fiftyTwoWeekHigh.toFixed(2) || '-'}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        {currentDetail && <div className="bg-[#9DB38A] h-2 rounded-full" style={{ width: `${((stock.price - currentDetail.fiftyTwoWeekLow) / (currentDetail.fiftyTwoWeekHigh - currentDetail.fiftyTwoWeekLow)) * 100}%` }} />}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Technicals</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs"><span className="text-gray-600">P/E:</span><span className="font-medium text-gray-900">{currentDetail?.peRatio || '-'}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-600">Sector:</span><span className="font-medium text-gray-900 truncate ml-2">{currentDetail?.sector?.slice(0, 10) || '-'}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 bg-gradient-to-br from-[#eff3eb] to-blue-50 rounded-lg p-3 border-2 border-[#9DB38A] flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase mb-2">AI Signal</p>
                      <p className={`text-2xl font-bold mb-1 ${stock.changePercent >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>{stock.changePercent >= 0 ? 'BUY' : 'HOLD'}</p>
                      <p className="text-xs text-gray-600 mb-3">Confidence: {Math.min(Math.abs(stock.changePercent * 10), 99).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Target:</p>
                      <p className="text-sm font-bold text-gray-900">${(stock.price * (1 + Math.abs(stock.changePercent) / 100)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={goToNext} className="absolute right-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group">
          <ChevronRight className="w-6 h-6 text-gray-900 group-hover:text-[#9DB38A] transition-colors" />
        </button>

        <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex space-x-2 items-center">
          {stocks.map((_, index) => (
            <button key={index} onClick={() => { setCurrentIndex(index); checkAndLoadMore(index) }} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-[#9DB38A] w-6' : 'bg-gray-400 hover:bg-gray-600'}`} />
          ))}
          {loadingMore && <div className="ml-2 text-sm text-gray-500">Loading more...</div>}
        </div>
      </div>

      {expandedStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={closeExpanded}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] p-8 relative overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-start justify-between pb-6 border-b">
                <div>
                  <h2 className="text-5xl font-bold text-gray-900">{expandedStock.symbol}</h2>
                  <p className="text-xl text-gray-600 mt-2">{expandedStock.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-gray-900">${expandedStock.price.toFixed(2)}</p>
                  <p className={`text-2xl font-semibold mt-2 ${expandedStock.change >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>
                    {expandedStock.change >= 0 ? '+' : ''}{expandedStock.change.toFixed(2)} ({expandedStock.changePercent >= 0 ? '+' : ''}{expandedStock.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>

              <div className="w-full h-96 rounded-xl bg-gray-50 border-2 border-gray-200 overflow-hidden">
                {expandedStock.chartData && expandedStock.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={expandedStock.chartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => { const date = new Date(value); return `${date.getMonth() + 1}/${date.getDate()}` }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', padding: '10px' }} formatter={(value: any) => [`$${value}`, 'Price']} labelFormatter={(label) => `Date: ${label}`} />
                      <Line type="monotone" dataKey="price" stroke={expandedStock.change >= 0 ? '#9DB38A' : '#c17b7b'} strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chart...</div>
                )}
              </div>

              <div className="flex gap-3">
                {['day', 'month', 'year'].map((tf) => (
                  <button key={tf} onClick={async (e) => { e.stopPropagation(); const newTimeframe = tf as 'day' | 'month' | 'year'; setTimeframe(newTimeframe); await fetchStockDetail(expandedStock.symbol); const updatedDetail = stockDetails[expandedStock.symbol]; if (updatedDetail) { setExpandedStock(updatedDetail) } }} className={`flex-1 py-3 px-6 rounded-lg text-base font-medium transition-colors ${timeframe === tf ? 'bg-[#9DB38A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2 grid grid-rows-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Price Info</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-base"><span className="text-gray-600">Open:</span><span className="font-medium text-gray-900">${expandedStock.open?.toFixed(2) || '-'}</span></div>
                      <div className="flex justify-between text-base"><span className="text-gray-600">High:</span><span className="font-medium text-gray-900">${expandedStock.high?.toFixed(2) || '-'}</span></div>
                      <div className="flex justify-between text-base"><span className="text-gray-600">Low:</span><span className="font-medium text-gray-900">${expandedStock.low?.toFixed(2) || '-'}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Volume</p>
                    <p className="text-2xl font-bold text-gray-900">{expandedStock.volume ? formatVolume(expandedStock.volume) : '-'}</p>
                    <p className="text-sm text-gray-600 mt-1">Avg: {expandedStock.avgVolume ? formatVolume(expandedStock.avgVolume) : '-'}</p>
                  </div>
                </div>

                <div className="col-span-2 grid grid-rows-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-3">52W Range</p>
                    <p className="text-base text-gray-900 font-medium mb-2">${expandedStock.fiftyTwoWeekLow?.toFixed(2) || '-'} - ${expandedStock.fiftyTwoWeekHigh?.toFixed(2) || '-'}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      {expandedStock.fiftyTwoWeekLow && expandedStock.fiftyTwoWeekHigh && <div className="bg-[#9DB38A] h-3 rounded-full transition-all" style={{ width: `${((expandedStock.price - expandedStock.fiftyTwoWeekLow) / (expandedStock.fiftyTwoWeekHigh - expandedStock.fiftyTwoWeekLow)) * 100}%` }} />}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Technicals</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-base"><span className="text-gray-600">P/E Ratio:</span><span className="font-medium text-gray-900">{expandedStock.peRatio || '-'}</span></div>
                      <div className="flex justify-between text-base"><span className="text-gray-600">Sector:</span><span className="font-medium text-gray-900 truncate ml-2" title={expandedStock.sector}>{expandedStock.sector || '-'}</span></div>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 bg-gradient-to-br from-[#eff3eb] to-blue-50 rounded-xl p-5 border-2 border-[#9DB38A] flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700 uppercase mb-3">AI Signal</p>
                    <p className={`text-4xl font-bold mb-2 ${expandedStock.changePercent >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>{expandedStock.changePercent >= 0 ? 'BUY' : 'HOLD'}</p>
                    <p className="text-sm text-gray-600 mb-4">Confidence: {Math.min(Math.abs(expandedStock.changePercent * 10), 99).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Price:</p>
                    <p className="text-xl font-bold text-gray-900">${(expandedStock.price * (1 + Math.abs(expandedStock.changePercent) / 100)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}