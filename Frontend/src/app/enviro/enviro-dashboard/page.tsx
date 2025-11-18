"use client"
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X } from "lucide-react";
import { PortfolioChart, PortfolioHistoryPoint } from "@/components/enviro-compoents-real/Portfolio";
import { PortfolioSummary } from "@/components/enviro-compoents-real/PortfolioSummary";
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import MarketTips from "@/components/enviro-compoents-real/market-tips";
import { StockCardStack } from '@/components/StockCardStack';
import StockTradeModal from '@/components/StockTradeModal';
import { TransactionHistory, Transaction} from "@/components/enviro-compoents-real/sandbox-transaction";

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
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  peRatio?: number
  sector: string
  industry: string
  marketCap: number
  chartData: Array<{ date: string; price: number }>
  forecastData?: Array<{ date: string; price: number }>
}

// Sample stock data - ALL available stocks
const allStocks = [
  { symbol: 'AAPL', company: 'Apple Inc.', price: 150.25, change: 2.50, changePercent: 1.69 },
  { symbol: 'GOOGL', company: 'Alphabet Inc.', price: 2800.00, change: -15.00, changePercent: -0.53 },
  { symbol: 'MSFT', company: 'Microsoft Corp.', price: 310.50, change: 5.25, changePercent: 1.72 },
  { symbol: 'TSLA', company: 'Tesla Inc.', price: 700.00, change: -10.00, changePercent: -1.41 },
  { symbol: 'AMZN', company: 'Amazon.com Inc.', price: 3300.00, change: 25.00, changePercent: 0.76 },
];

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-10-22 14:30',
    symbol: 'AAPL',
    action: 'Buy' as const,
    quantity: 10,
    price: 150.25,
    total: 1502.50,
  },
  {
    id: '2',
    date: '2025-10-23 10:15',
    symbol: 'TSLA',
    action: 'Sell' as const,
    quantity: 5,
    price: 700.00,
    total: 3500.00,
  },
];

const mockData: PortfolioHistoryPoint[] = [
  { timestamp: new Date('2024-09-01T12:00:00'), value: 2000 },
  { timestamp: new Date('2025-09-01'), value: 9500 },
  { timestamp: new Date('2025-09-05'), value: 9700 },
  { timestamp: new Date('2025-09-10'), value: 9900 },
  { timestamp: new Date('2025-09-15'), value: 10100 },
  { timestamp: new Date('2025-09-20'), value: 10250 },
  { timestamp: new Date('2025-09-25'), value: 10400 },
  { timestamp: new Date('2025-09-30'), value: 10600 },
  { timestamp: new Date('2025-10-01'), value: 10500 },
  { timestamp: new Date('2025-10-05'), value: 10700 },
  { timestamp: new Date('2025-10-08'), value: 2000 },
  { timestamp: new Date('2025-10-09'), value: 10850 },
];



function PortfolioDashboardPageContent() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState(allStocks);
  
  const [stocks, setStocks] = useState(allStocks);
  const [stockDetails, setStockDetails] = useState<{ [key: string]: StockDetail }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeframe, setTimeframe] = useState<'day' | 'month' | 'year' | 'all'>('day');
  const [loadingMore, setLoadingMore] = useState(false);
  const searchParams = useSearchParams()

  type Difficulty = 'easy' | 'medium' | 'hard'
  type Sandbox = { id: string; name: string; difficulty: Difficulty; balance: number; createdAt: string }

  const [sandbox, setSandbox] = useState<Sandbox | null>(null)
  const [cashBalance, setCashBalance] = useState<number>(3000)

  const router = useRouter()

  const deleteCurrentSandbox = () => {
    try {
      if (!sandbox) return
      const raw = localStorage.getItem('enviro_sandboxes')
      if (!raw) {
        router.push('/enviro')
        return
      }
      const items: Sandbox[] = JSON.parse(raw)
      const remaining = items.filter(s => s.id !== sandbox.id)
      localStorage.setItem('enviro_sandboxes', JSON.stringify(remaining))
      // also remove persisted portfolio for this sandbox
      try {
        const portRaw = localStorage.getItem('enviro_sandbox_portfolios')
        if (portRaw) {
          const map = JSON.parse(portRaw)
          delete map[sandbox.id]
          localStorage.setItem('enviro_sandbox_portfolios', JSON.stringify(map))
        }
      } catch (e) {
        console.warn('failed to remove sandbox portfolio', e)
      }
      // navigate back to sandbox manager
      router.push('/enviro')
    } catch (e) {
      console.error('Failed to delete sandbox', e)
    }
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('')

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStocks(allStocks);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query) || 
        stock.company.toLowerCase().includes(query)
      );
      setFilteredStocks(filtered);
    }
    // Reset to first card when search changes
    setCurrentIndex(0);
  }, [searchQuery]);

  // Update stocks when filtered stocks change
  useEffect(() => {
    setStocks(filteredStocks);
  }, [filteredStocks]);

  // Read sandboxId from query params and try to load matching sandbox from localStorage
  useEffect(() => {
    try {
      const id = searchParams?.get('sandboxId')
      if (!id) return
      const raw = localStorage.getItem('enviro_sandboxes')
      if (!raw) return
      const items: Sandbox[] = JSON.parse(raw)
      const found = items.find(s => s.id === id)
      if (found) {
        setSandbox(found)

        // load portfolio persisted for this sandbox if available
        try {
          const portRaw = localStorage.getItem('enviro_sandbox_portfolios')
          if (portRaw) {
            const map: { [id: string]: { cashBalance: number; transactions: Transaction[] } } = JSON.parse(portRaw)
            const saved = map[found.id]
            if (saved) {
              setCashBalance(saved.cashBalance)
              setTransactions(saved.transactions || [])
            } else {
              // initialize portfolio with sandbox balance
              setCashBalance(found.balance)
              setTransactions([])
              const newMap = map
              newMap[found.id] = { cashBalance: found.balance, transactions: [] }
              localStorage.setItem('enviro_sandbox_portfolios', JSON.stringify(newMap))
            }
          } else {
            // create initial portfolios map
            setCashBalance(found.balance)
            setTransactions([])
            const newMap: { [id: string]: { cashBalance: number; transactions: Transaction[] } } = {}
            newMap[found.id] = { cashBalance: found.balance, transactions: [] }
            localStorage.setItem('enviro_sandbox_portfolios', JSON.stringify(newMap))
          }
        } catch (e) {
          console.warn('Failed to load or initialize sandbox portfolio', e)
          setCashBalance(found.balance)
          setTransactions([])
        }
      }
    } catch (e) {
      console.warn('Failed to load sandbox from localStorage', e)
    }
  }, [searchParams])

  // Function to generate mock chart data
  const generateChartData = (symbol: string, timeframe: 'day' | 'month' | 'year' | 'all') => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return [];
    
  const points = timeframe === 'day' ? 24 : timeframe === 'month' ? 30 : timeframe === 'year' ? 365 : 730;
    const data = [];
    const basePrice = stock.price;
    
    for (let i = 0; i < points; i++) {
      const date = new Date();
      if (timeframe === 'day') {
        date.setHours(date.getHours() - (points - i));
      } else if (timeframe === 'month') {
        date.setDate(date.getDate() - (points - i));
      } else {
        date.setDate(date.getDate() - (points - i));
      }
      
      const randomVariation = (Math.random() - 0.5) * basePrice * 0.05;
      data.push({
        date: date.toISOString(),
        price: parseFloat((basePrice + randomVariation).toFixed(2))
      });
    }
    
    return data;
  };

  // Fetch stock details when needed
  const fetchStockDetail = async (symbol: string) => {
    if (stockDetails[symbol]) return;
    
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setStockDetails((prev: { [key: string]: StockDetail }) => ({
      ...prev,
      [symbol]: {
        ...stock,
        open: stock.price - Math.random() * 5,
        high: stock.price + Math.random() * 10,
        low: stock.price - Math.random() * 10,
        volume: Math.floor(Math.random() * 50000000),
        avgVolume: Math.floor(Math.random() * 40000000),
        fiftyTwoWeekHigh: stock.price + Math.random() * 50,
        fiftyTwoWeekLow: stock.price - Math.random() * 50,
        peRatio: parseFloat((Math.random() * 50 + 10).toFixed(2)),
        sector: ['Technology', 'Consumer', 'Energy', 'Finance'][Math.floor(Math.random() * 4)],
        industry: ['Software', 'Hardware', 'E-commerce', 'Banking'][Math.floor(Math.random() * 4)],
        marketCap: Math.floor(Math.random() * 1000000000000) + 10000000000,
        chartData: generateChartData(symbol, timeframe)
      }
    }));
  };

  // Check if we need to load more stocks
  const checkAndLoadMore = (index: number) => {
    // Placeholder - implement if you want infinite loading
  };

  // Fetch details for current stock
  useEffect(() => {
    if (stocks[currentIndex]) {
      fetchStockDetail(stocks[currentIndex].symbol);
    }
  }, [currentIndex, timeframe]);

  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);

  // compute holdings per symbol from transactions
  const holdingsMap: { [symbol: string]: number } = {}
  transactions.forEach(tx => {
    holdingsMap[tx.symbol] = (holdingsMap[tx.symbol] || 0) + (tx.action === 'Buy' ? tx.quantity : -tx.quantity)
  })

  const handleExecuteTrade = (action: 'Buy' | 'Sell', symbol: string, price: number, quantity: number) => {
    const total = price * quantity
    const now = new Date()
    const tx: Transaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      date: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      symbol,
      action,
      quantity,
      price,
      total,
    }

    // Compute new cash and transactions and persist immediately
    setTransactions(prev => {
      const next = [tx, ...prev]
      try {
        if (sandbox) {
          const portRaw = localStorage.getItem('enviro_sandbox_portfolios')
          const map = portRaw ? JSON.parse(portRaw) : {}
          const prevCash = (map[sandbox.id] && map[sandbox.id].cashBalance) || cashBalance
          const newCash = action === 'Buy' ? prevCash - total : prevCash + total
          map[sandbox.id] = { cashBalance: newCash, transactions: next }
          localStorage.setItem('enviro_sandbox_portfolios', JSON.stringify(map))
          setCashBalance(newCash)
        } else {
          // no sandbox selected: just update cash locally
          setCashBalance(prev => action === 'Buy' ? prev - total : prev + total)
        }
      } catch (e) {
        console.warn('Failed to persist trade', e)
      }

      return next
    })
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // wrapper to provide extra props to ExpandedModal
  // compute dynamic total value from cash + holdings
  const holdingsValue = Object.keys(holdingsMap).reduce((acc, sym) => {
    const qty = holdingsMap[sym] || 0
    const detail = stockDetails[sym] || allStocks.find(s => s.symbol === sym)
    const price = detail ? (detail as StockDetail | typeof allStocks[0]).price : 0
    return acc + qty * price
  }, 0)

  const totalValue = cashBalance + holdingsValue

  // baseline for gain/loss: if sandbox exists use its starting balance, otherwise use mock start
  const baseline = sandbox ? sandbox.balance : mockData[0].value
  const totalGainLoss = totalValue - baseline
  const totalGainLossPercent = baseline ? (totalGainLoss / baseline) * 100 : 0

  const ExpandedModalWrapper = (props: {
    stock: StockDetail
    onClose: () => void
    timeframe: 'day' | 'month' | 'year' | 'all'
    setTimeframe: (timeframe: 'day' | 'month' | 'year' | 'all') => void
    fetchStockDetail: (symbol: string) => Promise<void>
    stockDetails: { [key: string]: StockDetail }
  }) => {
    const symbol = props.stock?.symbol
    const holdings = symbol ? (holdingsMap[symbol] || 0) : 0
    return (
      <StockTradeModal
        {...props}
        cashBalance={cashBalance}
        holdings={holdings}
        onExecuteTrade={handleExecuteTrade}
      />
    )
  }

  return (
    <div>
      <main className="p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">{sandbox ? sandbox.name : 'My Sandbox'}</h1>

        <div className="flex w-full gap-6 max-h-[900px]">
          {/* Stock Card Section - contained with border */}
          <div className="w-1/2 border border-black rounded-lg bg-white p-6 overflow-hidden">
            {/* Search Bar */}
            
            <h2 className="text-2xl font-bold text-gray-900 pb-4">Explore</h2>

            <div className="mb-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Search stocks by symbol or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DB38A] focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-2">
                  {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <div style={{ 
                transform: 'scale(0.9)', 
                transformOrigin: 'top center',
                width: '650px'
              }}>
                <StockCardStack
                  stocks={stocks}
                  stockDetails={stockDetails}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  loadingMore={loadingMore}
                  checkAndLoadMore={checkAndLoadMore}
                  fetchStockDetail={fetchStockDetail}
                  ExpandedModal={ExpandedModalWrapper}
                />
              </div>
            </div>
          </div>

          {/* Portfolio Chart Section - contained with border */}
          <div className="w-1/2 border border-black rounded-lg bg-white pl-6 pr-6 pt-6">
            <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>

            <PortfolioChart portfolioHistory={mockData} />
            <div className="mt-8 w-full">
              <PortfolioSummary
                totalValue={totalValue}
                cashBalance={cashBalance}
                totalGainLoss={totalGainLoss}
                totalGainLossPercent={totalGainLossPercent}
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <MarketTips/>
        </div>

        <div className="pt-6">
          <TransactionHistory transactions={transactions} />
        </div>
        {/* Sandbox actions (delete current sandbox) */}
        <div className="pt-6 flex justify-end">
          {sandbox && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
              title="Delete this sandbox"
            >
              Delete Sandbox
            </button>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} />
            <div className="relative bg-white rounded-lg p-6 w-full max-w-md z-10">
              <h3 className="text-lg font-semibold mb-2">Confirm delete</h3>
              <p className="text-sm text-gray-600 mb-4">To permanently delete the sandbox <span className="font-medium">{sandbox?.name}</span>, type <span className="font-mono">delete</span> below and press Confirm.</p>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type delete to confirm"
                className="w-full border rounded px-3 py-2 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} className="px-3 py-2 rounded border">Cancel</button>
                <button
                  onClick={() => {
                    if (deleteConfirmText.trim().toLowerCase() === 'delete') {
                      deleteCurrentSandbox()
                    }
                  }}
                  disabled={deleteConfirmText.trim().toLowerCase() !== 'delete'}
                  className={`px-3 py-2 rounded text-white ${deleteConfirmText.trim().toLowerCase() === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PortfolioDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PortfolioDashboardPageContent />
    </Suspense>
  );
}