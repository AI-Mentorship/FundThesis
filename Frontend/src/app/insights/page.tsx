"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Star,
  BookmarkPlus,
  Activity,
  Brain,
  Calendar,
  BarChart3,
  Newspaper,
  TrendingDown,
  ArrowUpDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BookmarkedStock {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  priority: number;
  portfolioWeight?: number;
  enviroScore?: number;
}

interface Article {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: "Positive" | "Negative" | "Neutral";
  confidence: number;
}

interface StockInsight {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  healthScore: number;
  sentiment: {
    score: number;
    label: "Positive" | "Negative" | "Neutral";
    confidence: number;
  };
  articles: Article[];
  forecast: Record<
    Timeframe,
    Array<{ date: string; predicted: number; actual?: number }>
  >;
  fundamentals: {
    pe: number;
    eps: number;
    marketCap: string;
    volume: number;
    sector: string;
    dividendYield: number;
  };
  volatility: {
    beta: number;
    betaShift: string;
    var: number;
    varPercent: number;
  };
  upcomingEvents: Array<{
    date: string;
    event: string;
    impact: "High" | "Medium" | "Low";
  }>;
}

type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y";
type SortBy = "manual" | "portfolio" | "enviro";

const MOCK_STOCKS: BookmarkedStock[] = [
  {
    symbol: "AAPL",
    company: "Apple Inc.",
    price: 178.5,
    change: 2.3,
    changePercent: 1.31,
    priority: 1,
    portfolioWeight: 35,
    enviroScore: 72,
  },
  {
    symbol: "MSFT",
    company: "Microsoft Corp.",
    price: 420.15,
    change: -1.2,
    changePercent: -0.28,
    priority: 2,
    portfolioWeight: 28,
    enviroScore: 85,
  },
  {
    symbol: "NVDA",
    company: "NVIDIA Corp.",
    price: 875.4,
    change: 12.5,
    changePercent: 1.45,
    priority: 3,
    portfolioWeight: 20,
    enviroScore: 68,
  },
];

const MOCK_FORECAST: Record<
  Timeframe,
  Array<{ date: string; predicted: number; actual?: number }>
> = {
  "1D": [
    { date: "9:00", predicted: 176, actual: 175 },
    { date: "10:00", predicted: 177, actual: 176 },
    { date: "11:00", predicted: 178, actual: 177 },
    { date: "12:00", predicted: 179, actual: 178 },
    { date: "13:00", predicted: 180 },
    { date: "14:00", predicted: 181 },
    { date: "15:00", predicted: 182 },
  ],
  "1W": [
    { date: "Mon", predicted: 176, actual: 175 },
    { date: "Tue", predicted: 178, actual: 177 },
    { date: "Wed", predicted: 179, actual: 178 },
    { date: "Thu", predicted: 181, actual: 180 },
    { date: "Fri", predicted: 183 },
    { date: "Sat", predicted: 184 },
    { date: "Sun", predicted: 185 },
  ],
  "1M": [
    { date: "Week 1", predicted: 175, actual: 174 },
    { date: "Week 2", predicted: 178, actual: 177 },
    { date: "Week 3", predicted: 182, actual: 180 },
    { date: "Week 4", predicted: 185, actual: 183 },
    { date: "Week 5", predicted: 188 },
  ],
  "3M": [
    { date: "Jan", predicted: 180, actual: 178 },
    { date: "Feb", predicted: 185, actual: 182 },
    { date: "Mar", predicted: 190, actual: 188 },
    { date: "Apr", predicted: 195 },
  ],
  "1Y": [
    { date: "Jan", predicted: 170, actual: 168 },
    { date: "Feb", predicted: 172, actual: 171 },
    { date: "Mar", predicted: 175, actual: 173 },
    { date: "Apr", predicted: 178, actual: 176 },
    { date: "May", predicted: 180, actual: 179 },
    { date: "Jun", predicted: 183, actual: 181 },
    { date: "Jul", predicted: 185, actual: 184 },
    { date: "Aug", predicted: 188, actual: 186 },
    { date: "Sep", predicted: 190, actual: 189 },
    { date: "Oct", predicted: 193, actual: 191 },
    { date: "Nov", predicted: 195 },
    { date: "Dec", predicted: 198 },
  ],
};

export default function InsightsPage() {
  const [bookmarkedStocks, setBookmarkedStocks] =
    useState<BookmarkedStock[]>(MOCK_STOCKS);
  const [selectedStock, setSelectedStock] = useState<string>("AAPL");
  const [stockInsight, setStockInsight] = useState<StockInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [sortBy, setSortBy] = useState<SortBy>("manual");

  useEffect(() => {
    fetchStockInsight(selectedStock);
  }, [selectedStock]);
  useEffect(() => {
    sortStocks();
  }, [sortBy]);

  const sortStocks = () => {
    const sorted = [...bookmarkedStocks].sort((a, b) => {
      if (sortBy === "portfolio")
        return (b.portfolioWeight || 0) - (a.portfolioWeight || 0);
      if (sortBy === "enviro")
        return (b.enviroScore || 0) - (a.enviroScore || 0);
      return a.priority - b.priority;
    });
    setBookmarkedStocks(sorted);
  };

  const fetchStockInsight = async (symbol: string) => {
    setLoading(true);
    try {
      const stock = bookmarkedStocks.find((s) => s.symbol === symbol);
      const mockInsight: StockInsight = {
        symbol,
        company: stock?.company || "",
        price: stock?.price || 0,
        change: stock?.change || 0,
        changePercent: stock?.changePercent || 0,
        healthScore: 78,
        sentiment: { score: 0.75, label: "Positive", confidence: 0.89 },
        articles: [
          {
            title: "Apple announces new AI features for iPhone",
            source: "TechCrunch",
            url: "#",
            publishedAt: "2 hours ago",
            sentiment: "Positive",
            confidence: 0.92,
          },
          {
            title: "Analysts raise price target on AAPL stock",
            source: "Bloomberg",
            url: "#",
            publishedAt: "5 hours ago",
            sentiment: "Positive",
            confidence: 0.87,
          },
          {
            title: "Apple faces regulatory challenges in EU",
            source: "Reuters",
            url: "#",
            publishedAt: "1 day ago",
            sentiment: "Negative",
            confidence: 0.76,
          },
        ],
        forecast: MOCK_FORECAST,
        fundamentals: {
          pe: 28.5,
          eps: 6.25,
          marketCap: "2.75T",
          volume: 54320000,
          sector: "Technology",
          dividendYield: 0.52,
        },
        volatility: {
          beta: 1.24,
          betaShift: "+0.08",
          var: 8950,
          varPercent: 5.02,
        },
        upcomingEvents: [
          { date: "2025-02-01", event: "Q1 Earnings Report", impact: "High" },
          { date: "2025-03-15", event: "Product Launch Event", impact: "High" },
          {
            date: "2025-04-10",
            event: "Investor Conference",
            impact: "Medium",
          },
        ],
      };
      setStockInsight(mockInsight);
    } catch (err) {
      console.error("Error fetching insight:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (label: string) =>
    label === "Positive"
      ? "#9DB38A"
      : label === "Negative"
      ? "#c17b7b"
      : "#94a3b8";
  const getImpactColor = (impact: string) =>
    impact === "High"
      ? "text-red-600 bg-red-50"
      : impact === "Medium"
      ? "text-yellow-600 bg-yellow-50"
      : "text-blue-600 bg-blue-50";
  const formatVolume = (vol: number) =>
    vol >= 1e9
      ? `${(vol / 1e9).toFixed(2)}B`
      : vol >= 1e6
      ? `${(vol / 1e6).toFixed(2)}M`
      : vol >= 1e3
      ? `${(vol / 1e3).toFixed(2)}K`
      : vol.toString();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Stock Insights
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered analysis with sentiment, forecasting & health scores
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#9DB38A] text-white rounded-lg hover:bg-[#8ca379] transition-colors">
          <BookmarkPlus className="w-5 h-5" />
          Add Stock
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-[#9DB38A]" />
              Bookmarked
            </h2>
            <div className="relative group">
              <ArrowUpDown className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[#9DB38A]" />
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                {(["manual", "portfolio", "enviro"] as SortBy[]).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      sortBy === sort ? "text-[#9DB38A] font-semibold" : ""
                    }`}
                  >
                    {sort === "manual"
                      ? "Manual"
                      : sort === "portfolio"
                      ? "Portfolio Weight"
                      : "EnviroThesis"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {bookmarkedStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => setSelectedStock(stock.symbol)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedStock === stock.symbol
                    ? "bg-[#9DB38A] text-white"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{stock.symbol}</span>
                  <span className="text-sm">${stock.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs truncate">{stock.company}</span>
                  <span
                    className={`text-xs ${
                      stock.change >= 0 ? "text-green-600" : "text-red-600"
                    } ${selectedStock === stock.symbol ? "text-white" : ""}`}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                {sortBy !== "manual" && (
                  <div className="text-xs opacity-75">
                    {sortBy === "portfolio"
                      ? `Portfolio: ${stock.portfolioWeight}%`
                      : `Enviro: ${stock.enviroScore}/100`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-3 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-gray-200">
              <p className="text-gray-600">Loading insights...</p>
            </div>
          ) : stockInsight ? (
            <>
              {/* Health Score & Sentiment */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-[#9DB38A]" />
                    <h3 className="text-lg font-bold">Health Score</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#9DB38A"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${
                            2 *
                            Math.PI *
                            56 *
                            (1 - stockInsight.healthScore / 100)
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">
                          {stockInsight.healthScore}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Overall health based on:
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {[
                          "Technical indicators",
                          "Market momentum",
                          "Trading volume",
                          "Price stability",
                        ].map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-[#9DB38A]" />
                    <h3 className="text-lg font-bold">FinBERT Sentiment</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                      style={{
                        backgroundColor: getSentimentColor(
                          stockInsight.sentiment.label
                        ),
                      }}
                    >
                      {stockInsight.sentiment.label === "Positive"
                        ? "😊"
                        : stockInsight.sentiment.label === "Negative"
                        ? "😟"
                        : "😐"}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {stockInsight.sentiment.label}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Score: {stockInsight.sentiment.score.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Confidence:{" "}
                        {(stockInsight.sentiment.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Articles */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper className="w-5 h-5 text-[#9DB38A]" />
                  <h3 className="text-lg font-bold">Recent News & Sentiment</h3>
                </div>
                <div className="space-y-3">
                  {stockInsight.articles.map((article, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{
                          backgroundColor: getSentimentColor(article.sentiment),
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{article.publishedAt}</span>
                          <span>•</span>
                          <span
                            className={`font-medium ${
                              article.sentiment === "Positive"
                                ? "text-[#9DB38A]"
                                : article.sentiment === "Negative"
                                ? "text-[#c17b7b]"
                                : "text-gray-500"
                            }`}
                          >
                            {article.sentiment} (
                            {(article.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#9DB38A]" />
                    <h3 className="text-lg font-bold">
                      Price Chart & AI Forecast
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {(["1D", "1W", "1M", "3M", "1Y"] as Timeframe[]).map(
                      (tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            timeframe === tf
                              ? "bg-[#9DB38A] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {tf}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stockInsight.forecast[timeframe]}>
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#9DB38A"
                        strokeWidth={2}
                        dot={{ fill: "#9DB38A" }}
                        name="Actual"
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#60a5fa" }}
                        name="Forecast"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Fundamentals & Volatility */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#9DB38A]" />
                    <h3 className="text-lg font-bold">Fundamentals</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Market Cap",
                        value: stockInsight.fundamentals.marketCap,
                      },
                      {
                        label: "P/E Ratio",
                        value: stockInsight.fundamentals.pe,
                      },
                      {
                        label: "EPS",
                        value: `$${stockInsight.fundamentals.eps}`,
                      },
                      {
                        label: "Volume",
                        value: formatVolume(stockInsight.fundamentals.volume),
                      },
                      {
                        label: "Sector",
                        value: stockInsight.fundamentals.sector,
                      },
                      {
                        label: "Div. Yield",
                        value: `${stockInsight.fundamentals.dividendYield}%`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <p className="text-xs text-gray-600 mb-1">
                          {item.label}
                        </p>
                        <p
                          className={`font-bold text-gray-900 ${
                            item.label === "Sector" ? "text-lg" : "text-2xl"
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-5 h-5 text-[#9DB38A]" />
                    <h3 className="text-lg font-bold">Volatility & Risk</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600">Beta</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            stockInsight.volatility.betaShift.startsWith("+")
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {stockInsight.volatility.betaShift}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {stockInsight.volatility.beta}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Market sensitivity
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-2">
                        Value at Risk (VaR)
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${stockInsight.volatility.var.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stockInsight.volatility.varPercent}% max daily loss
                        (95% confidence)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#9DB38A]" />
                  <h3 className="text-lg font-bold">
                    Event-Driven Predictions
                  </h3>
                </div>
                <div className="space-y-3">
                  {stockInsight.upcomingEvents.map((event, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {event.event}
                        </p>
                        <p className="text-xs text-gray-600">{event.date}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getImpactColor(
                          event.impact
                        )}`}
                      >
                        {event.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
