"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { StockCardStack } from "@/components/StockCard";

interface Stock {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockDetailPoint {
  date: string;
  price: number;
  type?: "historical" | "forecast";
}

interface StockDetail {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  avgVolume: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  peRatio?: number;
  sector: string;
  industry: string;
  marketCap: number;
  chartData: StockDetailPoint[];
  forecastData?: StockDetailPoint[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function DiscoverPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockDetails, setStockDetails] = useState<{
    [key: string]: StockDetail;
  }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeframe, setTimeframe] = useState<"day" | "month" | "year">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch initial stocks
  useEffect(() => {
    console.log("🚀 Fetching initial stocks...");
    fetchStocks(0);
  }, []);

  // Filter stocks based on search query
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        stock.symbol.toLowerCase().includes(query) ||
        stock.company.toLowerCase().includes(query)
      );
    });
  }, [stocks, searchQuery]);

  // Reset currentIndex when search query changes or when filtered list becomes shorter
  useEffect(() => {
    if (currentIndex >= filteredStocks.length && filteredStocks.length > 0) {
      setCurrentIndex(filteredStocks.length - 1);
    } else if (filteredStocks.length === 0) {
      setCurrentIndex(0);
    }
  }, [searchQuery, filteredStocks.length, currentIndex]);

  const fetchStockDetail = useCallback(
    async (symbol: string) => {
      try {
        const days = timeframe === "day" ? 7 : timeframe === "month" ? 30 : 365;
        console.log(`📡 Fetching details for ${symbol} (${days} days)...`);
        const res = await fetch(`${API_URL}/api/stock/${symbol}?days=${days}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: StockDetail = await res.json();

        console.log(`✅ Data received for ${symbol}:`, {
          historicalPoints: data.chartData?.length || 0,
          forecastPoints: data.forecastData?.length || 0,
          chartData: data.chartData,
          forecastData: data.forecastData,
        });

        // Safely map historical and forecast points
        const historical = (data.chartData ?? []).map((d) => ({
          ...d,
          type: "historical" as const,
        }));
        const forecast = (data.forecastData ?? []).map((d) => ({
          ...d,
          type: "forecast" as const,
        }));

        console.log(`🎨 Mapped data:`, {
          historical: historical.length,
          forecast: forecast.length,
          sample: historical[0],
          forecastSample: forecast[0],
        });

        setStockDetails((prev) => ({
          ...prev,
          [symbol]: {
            ...data,
            chartData: historical,
            forecastData: forecast,
          },
        }));
      } catch (err) {
        console.error(`❌ Error fetching ${symbol}:`, err);
      }
    },
    [timeframe]
  );

  // Fetch stock details when currentIndex changes
  useEffect(() => {
    const currentSymbol = stocks[currentIndex]?.symbol;
    console.log(
      "📊 Current index changed:",
      currentIndex,
      "Symbol:",
      currentSymbol
    );
    if (currentSymbol && !stockDetails[currentSymbol]) {
      console.log("🔍 Fetching details for:", currentSymbol);
      fetchStockDetail(currentSymbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, stocks, fetchStockDetail]);

  // Refetch stock details when timeframe changes
  useEffect(() => {
    const currentSymbol = stocks[currentIndex]?.symbol;
    console.log(
      "⏰ Timeframe changed to:",
      timeframe,
      "for symbol:",
      currentSymbol
    );
    if (currentSymbol) {
      fetchStockDetail(currentSymbol);
    }
  }, [timeframe, currentIndex, stocks, fetchStockDetail]);

  const fetchStocks = async (offset: number) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      console.log(
        "📡 Fetching stocks from API...",
        `${API_URL}/api/stocks?limit=20&offset=${offset}`
      );
      const res = await fetch(
        `${API_URL}/api/stocks?limit=20&offset=${offset}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Stocks received:", data.stocks.length);
      interface ApiStock {
        symbol: string;
        price: number;
        change: number;
        changePercent: number;
      }
      const mapped = data.stocks.map((s: ApiStock) => ({
        ...s,
        company: `${s.symbol} Inc.`,
      }));
      setStocks((prev) => (offset === 0 ? mapped : [...prev, ...mapped]));
      setHasMore(data.hasMore);
      setError(null); // Clear error on successful fetch
    } catch (err) {
      console.error("❌ Error fetching stocks:", err);
      setError(
        `Unable to connect to API server at ${API_URL}. Please ensure the backend server is running.`
      );
      // Set empty array on error to prevent infinite loading state
      if (offset === 0) {
        setStocks([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const checkAndLoadMore = (idx: number) => {
    if (!loadingMore && hasMore && idx >= stocks.length - 5) {
      console.log("📥 Loading more stocks...");
      fetchStocks(stocks.length);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-2">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">
          Discover Stocks
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Explore trending stocks with our interactive card viewer
        </p>
        <div className="flex items-center justify-center py-20 text-gray-600">
          Loading stocks...
        </div>
      </main>
    );
  }

  if (error && stocks.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-2">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">
          Discover Stocks
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Explore trending stocks with our interactive card viewer
        </p>
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <p className="text-xl font-medium text-red-600 mb-2">
            Connection Error
          </p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchStocks(0);
            }}
            className="px-6 py-2 bg-[#9DB38A] text-white rounded-lg hover:bg-[#8ca279] transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // Ensure currentIndex is within bounds of filteredStocks
  const safeCurrentIndex = Math.min(
    currentIndex,
    Math.max(0, filteredStocks.length - 1)
  );

  const currentSymbol = filteredStocks[safeCurrentIndex]?.symbol;
  const stockDetail = currentSymbol ? stockDetails[currentSymbol] : undefined;
  const combinedChartData = [
    ...(stockDetail?.chartData ?? []),
    ...(stockDetail?.forecastData ?? []),
  ];

  console.log("🎯 Rendering with:", {
    currentSymbol,
    hasDetail: !!stockDetail,
    combinedPoints: combinedChartData.length,
    historicalPoints: stockDetail?.chartData?.length || 0,
    forecastPoints: stockDetail?.forecastData?.length || 0,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-2">
      <h1 className="text-4xl font-bold text-gray-900 mb-1">Discover Stocks</h1>
      <p className="text-lg text-gray-600 mb-2">
        Explore trending stocks with our interactive card viewer
      </p>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by symbol or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DB38A] focus:border-transparent"
          />
        </div>
      </div>

      {/* Stock Cards */}
      {filteredStocks.length > 0 ? (
        <div className="py-2">
          <StockCardStack
            stocks={filteredStocks}
            stockDetails={stockDetails}
            combinedChartData={combinedChartData}
            currentIndex={safeCurrentIndex}
            setCurrentIndex={setCurrentIndex}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            loadingMore={loadingMore}
            checkAndLoadMore={checkAndLoadMore}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <Search className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium">No stocks found</p>
          <p className="text-sm mt-2">
            Try searching for a different symbol or company name
          </p>
          <button
            onClick={clearSearch}
            className="mt-4 px-6 py-2 bg-[#9DB38A] text-white rounded-lg hover:bg-[#8ca279] transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </main>
  );
}

export default DiscoverPage;
