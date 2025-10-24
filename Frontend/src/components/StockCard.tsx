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

interface StockCardProps {
  stock: Stock
  detail?: StockDetail
  isActive: boolean
  timeframe: 'day' | 'month' | 'year'
  setTimeframe: (timeframe: 'day' | 'month' | 'year') => void
  onClick: () => void
}

export function StockCard({
  stock,
  detail,
  isActive,
  timeframe,
  setTimeframe,
  onClick
}: StockCardProps) {
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M'
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K'
    return vol.toString()
  }

  return (
    <div
      className="w-full h-full rounded-lg bg-white shadow-sm p-6 flex flex-col gap-4 border border-gray-200 hover:border-[#9DB38A] transition-all duration-300"
      onClick={onClick}
    >
      {/* Stock Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-900 text-3xl font-bold">{stock.symbol}</h3>
          <p className="text-gray-600 text-sm mt-1">{stock.company}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-900 text-3xl font-bold">${stock.price.toFixed(2)}</p>
          <p
            className={`text-lg font-semibold ${
              stock.change >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'
            }`}
          >
            {stock.change >= 0 ? '+' : ''}
            {stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}
            {stock.changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Stock Chart */}
      <div className="flex-shrink-0">
        <div className="w-full h-64 rounded-lg bg-gray-50 border-2 border-gray-200 overflow-hidden">
          {detail?.chartData && isActive ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detail.chartData}>
                <XAxis dataKey="date" tick={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} tick={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`$${value}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={stock.change >= 0 ? '#9DB38A' : '#c17b7b'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              {isActive ? 'Loading chart...' : 'Chart'}
            </div>
          )}
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className="flex gap-2">
        {['day', 'month', 'year'].map((tf) => (
          <button
            key={tf}
            onClick={(e) => {
              e.stopPropagation()
              setTimeframe(tf as 'day' | 'month' | 'year')
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              timeframe === tf
                ? 'bg-[#9DB38A] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

  <div className="w-full flex flex-col gap-4">
  {/* AI Signal */}
  <div className="w-full flex justify-between items-center p-3 bg-gradient-to-br from-[#eff3eb] to-blue-50 rounded-lg border-2 border-[#9DB38A]">
    <div>
      <p className="text-xs font-bold text-gray-700 uppercase mb-1">AI Signal</p>
      <p className={`text-lg font-bold ${stock.changePercent >= 0 ? 'text-[#9DB38A]' : 'text-[#c17b7b]'}`}>
        {stock.changePercent >= 0 ? 'BUY' : 'HOLD'}
      </p>
      <p className="text-xs text-gray-600">
        Confidence: {Math.min(Math.abs(stock.changePercent * 10), 99).toFixed(0)}%
      </p>
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-600">Target:</p>
      <p className="text-sm font-bold text-gray-900">
        ${(stock.price * (1 + Math.abs(stock.changePercent) / 100)).toFixed(2)}
      </p>
    </div>
  </div>

  {/* 4 Info Blocks 2x2 */}
  <div className="grid grid-cols-2 gap-3 w-full h-[240px]">
    {/* Block 1 */}
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Price Info</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Open:</span>
          <span className="font-medium text-gray-900">${detail?.open?.toFixed(2) || '-'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">High:</span>
          <span className="font-medium text-gray-900">${detail?.high?.toFixed(2) || '-'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Low:</span>
          <span className="font-medium text-gray-900">${detail?.low?.toFixed(2) || '-'}</span>
        </div>
      </div>
    </div>

    {/* Block 2 */}
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Volume</p>
      <p className="text-lg font-bold text-gray-900">{detail?.volume ? formatVolume(detail.volume) : '-'}</p>
      <p className="text-xs text-gray-600">Avg: {detail?.avgVolume ? formatVolume(detail.avgVolume) : '-'}</p>
    </div>

    {/* Block 3 */}
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">52W Range</p>
      <p className="text-xs text-gray-900 font-medium">
        ${detail?.fiftyTwoWeekLow.toFixed(2) || '-'} - ${detail?.fiftyTwoWeekHigh.toFixed(2) || '-'}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        {detail && (
          <div
            className="bg-[#9DB38A] h-2 rounded-full"
            style={{
              width: `${((stock.price - detail.fiftyTwoWeekLow) / (detail.fiftyTwoWeekHigh - detail.fiftyTwoWeekLow)) * 100}%`
            }}
          />
        )}
      </div>
    </div>

    {/* Block 4 */}
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Technicals</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">P/E:</span>
          <span className="font-medium text-gray-900">{detail?.peRatio || '-'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Sector:</span>
          <span className="font-medium text-gray-900 truncate ml-2">{detail?.sector?.slice(0, 10) || '-'}</span>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  )
}
