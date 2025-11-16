"use client";

import {
  FormEvent,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Search } from "lucide-react";
import { StockCardStack } from "@/components/StockCard";

interface Stock {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  forecastData?: StockDetailPoint[];
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

// Use Next.js API routes instead of external Flask server
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getDaysForTimeframe = (tf: "day" | "month" | "year") => {
  switch (tf) {
    case "day":
      return 7;
    case "month":
      return 30;
    default:
      return 365;
  }
};

const DEFAULT_PAGE_SIZE = 20;

const normaliseSummaryForecast = (points: unknown): StockDetailPoint[] => {
  if (!Array.isArray(points)) {
    return [];
  }

  return points
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const rawDate = record.date ?? record.Date;
      const rawPrice = record.price ?? record.Price ?? record.value;

      if (typeof rawDate !== "string" || rawDate.trim().length === 0) {
        return null;
      }

      const parsedDate = new Date(rawDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return null;
      }

      let price: number | null = null;
      if (typeof rawPrice === "number") {
        price = rawPrice;
      } else if (typeof rawPrice === "string" && rawPrice.trim().length > 0) {
        const parsed = Number(rawPrice);
        price = Number.isNaN(parsed) ? null : parsed;
      }

      if (price === null) {
        return null;
      }

      return {
        date: parsedDate.toISOString().split("T")[0],
        price,
      } satisfies StockDetailPoint;
    })
    .filter((point): point is StockDetailPoint => point !== null);
};

const mapApiStockSummary = (stock: {
  symbol: string;
  company?: string | null;
  price: number;
  change: number;
  changePercent: number;
  forecastData?: unknown;
}): Stock => {
  const forecastPoints = normaliseSummaryForecast(stock.forecastData);

  return {
    symbol: stock.symbol,
    company:
      stock.company && stock.company.trim().length > 0
        ? stock.company
        : `${stock.symbol} Inc.`,
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    forecastData: forecastPoints,
  };
};

const createPlaceholderDetail = (
  stock: Stock,
  forecastPoints: StockDetailPoint[] = [],
): StockDetail => ({
  symbol: stock.symbol,
  company: stock.company,
  price: stock.price,
  change: stock.change,
  changePercent: stock.changePercent,
  open: stock.price,
  high: stock.price,
  low: stock.price,
  volume: 0,
  avgVolume: 0,
  fiftyTwoWeekHigh: undefined,
  fiftyTwoWeekLow: undefined,
  peRatio: undefined,
  sector: "—",
  industry: "—",
  marketCap: 0,
  chartData: [],
  forecastData: forecastPoints,
});

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const defaultOffsetRef = useRef(0);

  const applyForecastToDetails = useCallback(
    (incomingStocks: Stock[], { reset = false }: { reset?: boolean } = {}) => {
      const entries = incomingStocks.filter(
        (stock) => Array.isArray(stock.forecastData) && stock.forecastData.length > 0,
      );

      if (reset && entries.length === 0) {
        setStockDetails({});
        return;
      }

      if (entries.length === 0) {
        return;
      }

      setStockDetails((prev) => {
        const next = reset ? {} : { ...prev };

        entries.forEach((stock) => {
          const forecastPoints = stock.forecastData ?? [];
          const existing = reset ? undefined : next[stock.symbol];

          if (existing) {
            next[stock.symbol] = {
              ...existing,
              price: stock.price,
              change: stock.change,
              changePercent: stock.changePercent,
              forecastData: forecastPoints,
            };
          } else {
            next[stock.symbol] = createPlaceholderDetail(stock, forecastPoints);
          }
        });

        return next;
      });
    },
    [],
  );

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

  const fetchStockDetailData = useCallback(
    async (symbol: string, tf: "day" | "month" | "year") => {
      const normalisedSymbol = symbol.trim().toUpperCase();
      const days = getDaysForTimeframe(tf);
      console.log(`📡 Fetching details for ${normalisedSymbol} (${days} days)...`);
      const res = await fetch(`/api/stock/${normalisedSymbol}?days=${days}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: StockDetail = await res.json();
      const historical = (data.chartData ?? []).map((d) => ({
        ...d,
        type: "historical" as const,
      }));
      const forecast = (data.forecastData ?? []).map((d) => ({
        ...d,
        type: "forecast" as const,
      }));

      return {
        ...data,
        symbol: normalisedSymbol,
        chartData: historical,
        forecastData: forecast,
      } satisfies StockDetail;
    },
    []
  );

  const fetchStockDetail = useCallback(
    async (symbol: string, tf: "day" | "month" | "year" = timeframe) => {
      try {
        const detail = await fetchStockDetailData(symbol, tf);
        setStockDetails((prev) => ({
          ...prev,
          [detail.symbol]: detail,
        }));
        return detail;
      } catch (err) {
        console.error(`❌ Error fetching ${symbol}:`, err);
        return null;
      }
    },
    [fetchStockDetailData, timeframe]
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

  const fetchDefaultStocks = useCallback(
    async (
      { reset = false, mode = "more" as const }: { reset?: boolean; mode?: "initial" | "more" } = {}
    ) => {
      const showInitialLoading = mode === "initial";
      const offset = reset ? 0 : defaultOffsetRef.current;

      if (reset) {
        defaultOffsetRef.current = 0;
      }

      try {
        if (showInitialLoading) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const res = await fetch(
          `/api/stocks?limit=${DEFAULT_PAGE_SIZE}&offset=${offset}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const mapped: Stock[] = Array.isArray(data.stocks)
          ? data.stocks.map((stock: unknown) =>
              mapApiStockSummary(stock as Record<string, unknown> as any),
            )
          : [];

        defaultOffsetRef.current = offset + mapped.length;
        setHasMore(Boolean(data.hasMore));

        setStocks((prev) => {
          const base = reset ? [] : prev;
          const existingSymbols = new Set(base.map((stock) => stock.symbol));
          const newStocks = mapped.filter(
            (stock) => !existingSymbols.has(stock.symbol)
          );
          return reset ? newStocks : [...base, ...newStocks];
        });

        applyForecastToDetails(mapped, { reset });

        setError(null);
      } catch (err) {
        console.error("❌ Error fetching stocks:", err);
        if (reset) {
          setStocks([]);
        }
        setError("Unable to fetch stock data. Please try again later.");
      } finally {
        if (showInitialLoading) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [applyForecastToDetails]
  );

  const checkAndLoadMore = (idx: number) => {
    if (!loadingMore && hasMore && idx >= stocks.length - 5) {
      void fetchDefaultStocks();
    }
  };

  const handleSearchSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const rawQuery = searchQuery.trim();

      if (rawQuery.length === 0) {
        setSearchFeedback("Enter a stock symbol to search.");
        return;
      }

      const symbol = rawQuery.toUpperCase();
      setSearchFeedback(null);

      const existingIndex = stocks.findIndex(
        (stock) => stock.symbol.toUpperCase() === symbol
      );

      if (existingIndex >= 0) {
        setCurrentIndex(existingIndex);
        if (!stockDetails[symbol]) {
          await fetchStockDetail(symbol);
        }
        return;
      }

      setIsSearching(true);

      try {
        const detail = await fetchStockDetailData(symbol, timeframe);

        setStockDetails((prev) => ({
          ...prev,
          [detail.symbol]: detail,
        }));

        setStocks((prev) => {
          const summary: Stock = {
            symbol: detail.symbol,
            company: detail.company,
            price: detail.price,
            change: detail.change,
            changePercent: detail.changePercent,
            forecastData: detail.forecastData ?? [],
          };

          const filtered = prev.filter(
            (stock) => stock.symbol.toUpperCase() !== detail.symbol.toUpperCase()
          );

          return [summary, ...filtered];
        });

        setCurrentIndex(0);
      } catch (err) {
        console.error("❌ Search error:", err);
        setSearchFeedback(
          "We couldn't load that symbol right now. Try a different one."
        );
      } finally {
        setIsSearching(false);
      }
    },
    [
      fetchStockDetail,
      fetchStockDetailData,
      searchQuery,
      stocks,
      stockDetails,
      timeframe,
    ]
  );

  const loadInitialStocks = useCallback(async () => {
    let loadedFromUserPortfolio = false;

    try {
      setLoading(true);

      const portfolioResponse = await fetch("/api/dashboard/portfolio", {
        method: "GET",
        credentials: "include",
      });

      if (portfolioResponse.ok) {
        const payload = await portfolioResponse.json();
        console.log("📦 Portfolio payload:", payload);
        const userTickers = Array.isArray(payload.tickers)
          ? Array.from(
              new Set(
                payload.tickers
                  .map((ticker: unknown) =>
                    typeof ticker === "string" ? ticker.trim().toUpperCase() : ""
                  )
                  .filter((ticker: string) => ticker.length > 0)
              )
            )
          : [];

        console.log("🎯 User tickers extracted:", userTickers);

        if (userTickers.length > 0) {
          const symbolsParam = encodeURIComponent(userTickers.join(","));
          const stocksResponse = await fetch(
            `/api/stocks?symbols=${symbolsParam}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (stocksResponse.ok) {
            const data = await stocksResponse.json();
            console.log("📊 Stocks API response:", data);
            const mapped: Stock[] = Array.isArray(data.stocks)
              ? data.stocks.map((stock: unknown) =>
                  mapApiStockSummary(stock as Record<string, unknown> as any),
                )
              : [];

            console.log("✅ Mapped stocks for cards:", mapped);

            setStocks(mapped);
            applyForecastToDetails(mapped, { reset: true });
            setHasMore(Boolean(data.hasMore));
            defaultOffsetRef.current = 0;
            setError(null);
            loadedFromUserPortfolio = true;

            if (mapped.length > 0) {
              await fetchStockDetail(mapped[0].symbol);
            }
          } else {
            console.error("❌ Stocks API failed:", stocksResponse.status, await stocksResponse.text());
          }
        }
      }
    } catch (err) {
      console.error("❌ Error loading portfolio stocks:", err);
    } finally {
      if (loadedFromUserPortfolio) {
        setLoading(false);
      }
    }

    if (!loadedFromUserPortfolio) {
      await fetchDefaultStocks({ reset: true, mode: "initial" });
    }
  }, [applyForecastToDetails, fetchDefaultStocks, fetchStockDetail]);

  useEffect(() => {
    loadInitialStocks();
  }, [loadInitialStocks]);

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentIndex(0);
    setSearchFeedback(null);
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
              void loadInitialStocks();
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
      <form className="mb-4 space-y-2" onSubmit={handleSearchSubmit}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by symbol or company name..."
              value={searchQuery}
              onChange={(e) => {
                if (searchFeedback) {
                  setSearchFeedback(null);
                }
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DB38A] focus:border-transparent"
              disabled={isSearching}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#9DB38A] text-white font-medium hover:bg-[#8ca279] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSearching}
          >
            {isSearching ? "Searching…" : "Search"}
          </button>
        </div>
        {searchFeedback && (
          <p className="text-sm font-medium text-red-600">{searchFeedback}</p>
        )}
      </form>

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
