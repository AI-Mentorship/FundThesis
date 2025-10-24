"use client"
import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { PortfolioChart, PortfolioHistoryPoint } from "@/components/enviro-compoents-real/Portfolio";
import { PortfolioSummary } from "@/components/enviro-compoents-real/PortfolioSummary";
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import MarketTips from "@/components/enviro-compoents-real/market-tips";
import { StockCardStack } from '@/components/StockCardStack';
import { TransactionHistory, Transaction} from "@/components/enviro-compoents-real/sandbox-transaction";

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

const totalValue = 10850;
const cashBalance = 3000;
const totalGainLoss = totalValue - mockData[0].value;
const totalGainLossPercent = (totalGainLoss / mockData[0].value) * 100;

export default function PortfolioDashboardPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState(allStocks);
  
  const [stocks, setStocks] = useState(allStocks);
  const [stockDetails, setStockDetails] = useState<any>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeframe, setTimeframe] = useState<'day' | 'month' | 'year'>('day');
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Function to generate mock chart data
  const generateChartData = (symbol: string, timeframe: 'day' | 'month' | 'year') => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return [];
    
    const points = timeframe === 'day' ? 24 : timeframe === 'month' ? 30 : 365;
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
    
    setStockDetails((prev: any) => ({
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
        peRatio: (Math.random() * 50 + 10).toFixed(2),
        sector: ['Technology', 'Consumer', 'Energy', 'Finance'][Math.floor(Math.random() * 4)],
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

  const transactions = sampleTransactions;

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div>
      <main className="p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>

        <div className="flex w-full gap-6 max-h-[900px]">
          {/* Stock Card Section - contained with border */}
          <div className="w-1/2 border border-black rounded-lg bg-white p-6 overflow-hidden">
            {/* Search Bar */}
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
                />
              </div>
            </div>
          </div>

          {/* Portfolio Chart Section - contained with border */}
          <div className="w-1/2 border border-black rounded-lg bg-white p-11">
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
      </main>
    </div>
  );
}