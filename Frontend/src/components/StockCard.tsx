"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Stock {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
}

interface ChartDataPoint {
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
  chartData: ChartDataPoint[];
  forecastData?: ChartDataPoint[];
}

interface StockCardStackProps {
  stocks: Stock[];
  stockDetails: { [key: string]: StockDetail };
  combinedChartData: ChartDataPoint[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  timeframe: "day" | "month" | "year";
  setTimeframe: (timeframe: "day" | "month" | "year") => void;
  loadingMore: boolean;
  checkAndLoadMore: (index: number) => void;
}

// Helper to safely format numbers
const formatNumber = (num: number | undefined | null, decimals = 2) => {
  if (num == null) return "-";
  const numValue = typeof num === 'number' ? num : Number(num);
  if (isNaN(numValue) || !isFinite(numValue)) return "-";
  return numValue.toFixed(decimals);
};

// Helper to format volume
const formatVolume = (vol: number | undefined | null) => {
  if (vol == null) return "-";
  const volValue = typeof vol === 'number' ? vol : Number(vol);
  if (isNaN(volValue) || !isFinite(volValue)) return "-";
  if (volValue >= 1_000_000) return (volValue / 1_000_000).toFixed(1) + "M";
  if (volValue >= 1_000) return (volValue / 1_000).toFixed(1) + "K";
  return volValue.toString();
};

// Helper to format market cap
const formatMarketCap = (cap: number | undefined | null) => {
  if (!cap) return "-";
  if (cap >= 1_000_000_000_000) return "$" + (cap / 1_000_000_000_000).toFixed(2) + "T";
  if (cap >= 1_000_000_000) return "$" + (cap / 1_000_000_000).toFixed(2) + "B";
  if (cap >= 1_000_000) return "$" + (cap / 1_000_000).toFixed(2) + "M";
  return "$" + cap.toString();
};

// Custom tooltip to show if data is historical or forecast
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="text-xs text-gray-600">{data.date}</p>
        <p className="text-sm font-bold text-gray-900">
          ${formatNumber(data.price)}
        </p>
        {data.type === "forecast" && (
          <p className="text-xs text-[#9DB38A] font-semibold mt-1">Forecast</p>
        )}
      </div>
    );
  }
  return null;
};

// StockCard component for individual card rendering
interface StockCardProps {
  stock: Stock;
  detail?: StockDetail;
  isActive: boolean;
  timeframe: "day" | "month" | "year" | "all";
  setTimeframe: (timeframe: "day" | "month" | "year" | "all") => void;
  onClick: () => void;
  chartData?: ChartDataPoint[];
}

export function StockCard({
  stock,
  detail,
  isActive,
  timeframe,
  setTimeframe,
  onClick,
  chartData = [],
}: StockCardProps) {
  const combinedChartData = chartData || [];
  const currentDetail = detail;

  return (
    <div
      className="w-full h-full rounded-lg bg-white shadow-sm p-6 flex flex-col gap-4 border border-gray-200 hover:border-[#9DB38A] transition-all duration-300"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-900 text-3xl font-bold">{stock.symbol}</h3>
          <p className="text-gray-600 text-sm mt-1">{stock.company}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-900 text-3xl font-bold">
            ${formatNumber(stock.price)}
          </p>
          <p
            className={`text-lg font-semibold ${
              stock.change >= 0 ? "text-[#9DB38A]" : "text-[#c17b7b]"
            }`}
          >
            {stock.change >= 0 ? "+" : ""}
            {formatNumber(stock.change)} (
            {stock.changePercent >= 0 ? "+" : ""}
            {formatNumber(stock.changePercent)}%)
          </p>
        </div>
      </div>

      <div className="flex-shrink-0">
        <div className="w-full h-64 rounded-lg bg-gray-50 border-2 border-gray-200 overflow-hidden relative">
          {isActive && (
            <div className="absolute top-2 left-2 text-xs bg-white/80 p-1 rounded z-10">
              H:
              {combinedChartData.filter((d) => d.type !== "forecast").length} F:
              {combinedChartData.filter((d) => d.type === "forecast").length}
            </div>
          )}
          {isActive && combinedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedChartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={stock.change >= 0 ? "#9DB38A" : "#c17b7b"}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                />
                {combinedChartData.some((d) => d.type === "forecast") && (
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={true}
                    data={combinedChartData.map((d) =>
                      d.type === "forecast" ? d : { ...d, price: null }
                    )}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              {isActive ? "Loading chart..." : "Chart"}
            </div>
          )}
        </div>
        {isActive &&
          combinedChartData.some((d) => d.type === "forecast") && (
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-[#9DB38A]"></div>
                <span className="text-gray-600">Historical</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2 border-blue-500"></div>
                <span className="text-gray-600">Forecast</span>
              </div>
            </div>
          )}
      </div>

      <div className="flex gap-2">
        {["day", "month", "year"].map((tf) => (
          <button
            key={tf}
            onClick={(e) => {
              e.stopPropagation();
              if (tf !== "all") {
                setTimeframe(tf as "day" | "month" | "year");
              }
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              timeframe === tf
                ? "bg-[#9DB38A] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3 h-[240px]">
        <div className="col-span-2 grid grid-rows-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Price Info
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Open:</span>
                <span className="font-medium text-gray-900">
                  ${formatNumber(currentDetail?.open)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">High:</span>
                <span className="font-medium text-gray-900">
                  ${formatNumber(currentDetail?.high)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Low:</span>
                <span className="font-medium text-gray-900">
                  ${formatNumber(currentDetail?.low)}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Volume
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatVolume(currentDetail?.volume)}
            </p>
            <p className="text-xs text-gray-600">
              Avg: {formatVolume(currentDetail?.avgVolume)}
            </p>
          </div>
        </div>

        <div className="col-span-2 grid grid-rows-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              52W Range
            </p>
            <p className="text-xs text-gray-900 font-medium">
              ${formatNumber(currentDetail?.fiftyTwoWeekLow)} - $
              {formatNumber(currentDetail?.fiftyTwoWeekHigh)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              {currentDetail?.fiftyTwoWeekLow != null &&
                currentDetail?.fiftyTwoWeekHigh != null && (
                  <div
                    className="bg-[#9DB38A] h-2 rounded-full"
                    style={{
                      width: `${
                        ((stock.price - currentDetail.fiftyTwoWeekLow) /
                          (currentDetail.fiftyTwoWeekHigh -
                            currentDetail.fiftyTwoWeekLow)) *
                        100
                      }%`,
                    }}
                  />
                )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Technicals
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">P/E:</span>
                <span className="font-medium text-gray-900">
                  {formatNumber(currentDetail?.peRatio)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Sector:</span>
                <span className="font-medium text-gray-900 truncate ml-2">
                  {currentDetail?.sector || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-gradient-to-br from-[#eff3eb] to-blue-50 rounded-lg p-3 border-2 border-[#9DB38A] flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase mb-2">
              AI Signal
            </p>
            <p
              className={`text-2xl font-bold mb-1 ${
                stock.changePercent >= 0 ? "text-[#9DB38A]" : "text-[#c17b7b]"
              }`}
            >
              {stock.changePercent >= 0 ? "BUY" : "HOLD"}
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Confidence:{" "}
              {Math.min(Math.abs(stock.changePercent * 10), 99).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Target:</p>
            <p className="text-sm font-bold text-gray-900">
              $
              {formatNumber(
                stock.price * (1 + Math.abs(stock.changePercent) / 100)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StockCardStack({
  stocks,
  stockDetails,
  combinedChartData,
  currentIndex,
  setCurrentIndex,
  timeframe,
  setTimeframe,
  loadingMore,
  checkAndLoadMore,
}: StockCardStackProps) {
  const [expandedStock, setExpandedStock] = useState<StockDetail | null>(null);

  // Calculate dynamic Y-axis domain based on all data points
  const getYAxisDomain = (data: ChartDataPoint[]) => {
    if (data.length === 0) return ["auto", "auto"];

    const prices = data
      .map((d) => d.price)
      .filter((p) => p != null && !isNaN(p));
    if (prices.length === 0) return ["auto", "auto"];

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const padding = range > 0 ? range * 0.15 : 5; // 15% padding or minimum $5

    return [minPrice - padding, maxPrice + padding];
  };

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + stocks.length) % stocks.length;
    setCurrentIndex(newIndex);
    checkAndLoadMore(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % stocks.length;
    setCurrentIndex(newIndex);
    checkAndLoadMore(newIndex);
  };

  const handleCardClick = (stock: Stock, index: number) => {
    if (index === currentIndex) {
      const detail = stockDetails[stock.symbol];
      if (detail) setExpandedStock(detail);
    } else {
      setCurrentIndex(index);
    }
  };

  const closeExpanded = () => setExpandedStock(null);

  const getCardStyle = (stockIndex: number) => {
    let relativePosition = stockIndex - currentIndex;
    if (relativePosition > stocks.length / 2) relativePosition -= stocks.length;
    else if (relativePosition < -stocks.length / 2)
      relativePosition += stocks.length;

    const distance = Math.abs(relativePosition);
    if (distance === 0)
      return {
        transform: "translateX(0) scale(1)",
        zIndex: 30,
        filter: "blur(0px)",
        opacity: 1,
      };
    if (distance === 1)
      return {
        transform: `translateX(${
          relativePosition > 0 ? "180px" : "-180px"
        }) scale(0.85)`,
        zIndex: 20,
        filter: "blur(2px)",
        opacity: 0.6,
      };
    if (distance === 2)
      return {
        transform: `translateX(${
          relativePosition > 0 ? "300px" : "-300px"
        }) scale(0.7)`,
        zIndex: 10,
        filter: "blur(4px)",
        opacity: 0.3,
      };
    return {
      transform: `translateX(${
        relativePosition > 0 ? "400px" : "-400px"
      }) scale(0.6)`,
      zIndex: 1,
      filter: "blur(6px)",
      opacity: 0,
    };
  };

  // Calculate Y-axis domain for current stock (must be before early return)
  useMemo(() => {
    if (combinedChartData.length === 0) {
      console.log("⚠️ No data for domain calculation");
      return ["auto", "auto"];
    }

    const historicalData = combinedChartData.filter(
      (d) => d.type !== "forecast"
    );
    const forecastData = combinedChartData.filter((d) => d.type === "forecast");

    console.log("📊 Data breakdown:", {
      total: combinedChartData.length,
      historical: historicalData.length,
      forecast: forecastData.length,
    });

    const domain = getYAxisDomain(combinedChartData);
    console.log(
      "📊 Y-axis domain calculated:",
      domain,
      "for",
      combinedChartData.length,
      "points"
    );

    if (combinedChartData.length > 0) {
      const prices = combinedChartData
        .map((d) => d.price)
        .filter((p) => p != null);
      console.log(
        "💰 Price range in combined data:",
        Math.min(...prices),
        "to",
        Math.max(...prices)
      );

      if (forecastData.length > 0) {
        const forecastPrices = forecastData
          .map((d) => d.price)
          .filter((p) => p != null);
        console.log(
          "🔮 Forecast price range:",
          Math.min(...forecastPrices),
          "to",
          Math.max(...forecastPrices)
        );
      }
    }
    return domain;
  }, [combinedChartData]);

  if (stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-auto py-20">
        <div className="text-gray-600">No stocks available</div>
      </div>
    );
  }

  const currentStock = stocks[currentIndex];
  const currentDetail = stockDetails[currentStock?.symbol];

  return (
    <>
      <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto px-8 overflow-hidden">
        <button
          onClick={goToPrevious}
          className="absolute left-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900 group-hover:text-[#9DB38A] transition-colors" />
        </button>

        <div className="relative w-full min-h-[950px] flex items-center justify-center py-8 overflow-hidden">
          {stocks.map((stock, index) => (
            <div
              key={`${stock.symbol}-${index}`}
              className="absolute w-full max-w-[650px] min-h-[900px] transition-all duration-500 ease-out cursor-pointer"
              style={getCardStyle(index)}
              onClick={() => handleCardClick(stock, index)}
            >
              <div className="w-full h-full rounded-lg bg-white shadow-sm p-6 flex flex-col gap-4 border border-gray-200 hover:border-[#9DB38A] transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-gray-900 text-3xl font-bold">
                      {stock.symbol}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {stock.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 text-3xl font-bold">
                      ${formatNumber(stock.price)}
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        stock.change >= 0 ? "text-[#9DB38A]" : "text-[#c17b7b]"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {formatNumber(stock.change)} (
                      {stock.changePercent >= 0 ? "+" : ""}
                      {formatNumber(stock.changePercent)}%)
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-full h-64 rounded-lg bg-gray-50 border-2 border-gray-200 overflow-hidden relative">
                    {index === currentIndex && combinedChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={combinedChartData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(date) =>
                              new Date(date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            }
                            domain={['dataMin', 'dataMax']}
                            type="category"
                            allowDataOverflow={false}
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => `$${value.toFixed(0)}`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          
                          {/* Historical line - only shows historical data */}
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke={stock.change >= 0 ? "#9DB38A" : "#c17b7b"}
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                            data={combinedChartData.map((d) =>
                              d.type !== "forecast" ? d : { ...d, price: null }
                            )}
                          />
                          
                          {/* Forecast line with connection point - clearly dashed */}
                          {combinedChartData.some((d) => d.type === "forecast") && (
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#9DB38A"
                              strokeWidth={2.5}
                              strokeDasharray="8 4"
                              dot={false}
                              connectNulls={false}
                              opacity={0.8}
                              data={(() => {
                                const historicalPoints = combinedChartData.filter(d => d.type !== "forecast");
                                const lastHistorical = historicalPoints[historicalPoints.length - 1];
                                
                                return combinedChartData.map((d) => {
                                  if (d === lastHistorical) return d;
                                  if (d.type === "forecast") return d;
                                  return { ...d, price: null };
                                });
                              })()}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        {index === currentIndex ? "Loading chart..." : "Chart"}
                      </div>
                    )}
                  </div>
                  {/* Legend */}
                  {index === currentIndex &&
                    combinedChartData.some((d) => d.type === "forecast") && (
                      <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-0.5 bg-[#9DB38A]"></div>
                          <span className="text-gray-600">Historical</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg width="16" height="2" className="overflow-visible">
                            <line 
                              x1="0" 
                              y1="1" 
                              x2="16" 
                              y2="1" 
                              stroke="#9DB38A" 
                              strokeWidth="2" 
                              strokeDasharray="3,2"
                            />
                          </svg>
                          <span className="text-gray-600">Forecast</span>
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex gap-2">
                  {["day", "month", "year"].map((tf) => (
                    <button
                      key={tf}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTimeframe(tf as "day" | "month" | "year");
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        timeframe === tf
                          ? "bg-[#9DB38A] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Price, Volume, 52W Range, Technicals */}
                <div className="grid grid-cols-5 gap-3 h-[240px]">
                  <div className="col-span-2 grid grid-rows-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Price Info
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Open:</span>
                          <span className="font-medium text-gray-900">
                            ${formatNumber(currentDetail?.open)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">High:</span>
                          <span className="font-medium text-gray-900">
                            ${formatNumber(currentDetail?.high)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Low:</span>
                          <span className="font-medium text-gray-900">
                            ${formatNumber(currentDetail?.low)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Volume
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatVolume(currentDetail?.volume)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Avg: {formatVolume(currentDetail?.avgVolume)}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 grid grid-rows-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        52W Range
                      </p>
                      <p className="text-xs text-gray-900 font-medium">
                        ${formatNumber(currentDetail?.fiftyTwoWeekLow)} - $
                        {formatNumber(currentDetail?.fiftyTwoWeekHigh)}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        {currentDetail?.fiftyTwoWeekLow != null &&
                          currentDetail?.fiftyTwoWeekHigh != null && (
                            <div
                              className="bg-[#9DB38A] h-2 rounded-full"
                              style={{
                                width: `${
                                  ((stock.price -
                                    currentDetail.fiftyTwoWeekLow) /
                                    (currentDetail.fiftyTwoWeekHigh -
                                      currentDetail.fiftyTwoWeekLow)) *
                                  100
                                }%`,
                              }}
                            />
                          )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Technicals
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">P/E:</span>
                          <span className="font-medium text-gray-900">
                            {formatNumber(currentDetail?.peRatio)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Sector:</span>
                          <span className="font-medium text-gray-900 truncate ml-2">
                            {currentDetail?.sector || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 bg-gradient-to-br from-[#eff3eb] to-gray-50 rounded-lg p-3 border-2 border-[#9DB38A] flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase mb-2">
                        AI Signal
                      </p>
                      <p
                        className={`text-2xl font-bold mb-1 ${
                          stock.changePercent >= 0
                            ? "text-[#9DB38A]"
                            : "text-[#c17b7b]"
                        }`}
                      >
                        {stock.changePercent >= 0 ? "BUY" : "HOLD"}
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        Confidence:{" "}
                        {Math.min(
                          Math.abs(stock.changePercent * 10),
                          99
                        ).toFixed(0)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Target:</p>
                      <p className="text-sm font-bold text-gray-900">
                        $
                        {formatNumber(
                          stock.price *
                            (1 + Math.abs(stock.changePercent) / 100)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={goToNext}
          className="absolute right-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
        >
          <ChevronRight className="w-6 h-6 text-gray-900 group-hover:text-[#9DB38A] transition-colors" />
        </button>
      </div>

      {/* EXPANDED MODAL VIEW */}
      {expandedStock && (() => {
        // Use live data from stockDetails if available
        const liveStockDetail = stockDetails[expandedStock.symbol] || expandedStock;
        const expandedChartData = [
          ...(liveStockDetail.chartData || []),
          ...(liveStockDetail.forecastData || []),
        ];
        
        return (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={closeExpanded}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-start justify-between z-10">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {liveStockDetail.symbol}
                </h2>
                <p className="text-lg text-gray-600">{liveStockDetail.company}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {liveStockDetail.sector}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {liveStockDetail.industry}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-gray-900 mb-2">
                  ${formatNumber(liveStockDetail.price)}
                </p>
                <p
                  className={`text-2xl font-semibold ${
                    liveStockDetail.change >= 0
                      ? "text-[#9DB38A]"
                      : "text-[#c17b7b]"
                  }`}
                >
                  {liveStockDetail.change >= 0 ? "+" : ""}
                  {formatNumber(liveStockDetail.change)} (
                  {liveStockDetail.changePercent >= 0 ? "+" : ""}
                  {formatNumber(liveStockDetail.changePercent)}%)
                </p>
              </div>
              <button
                onClick={closeExpanded}
                className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Large Chart */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Price Chart with AI Forecast
                  </h3>
                  <div className="flex items-center gap-4">
                    {/* Timeframe Selector */}
                    <div className="flex gap-2">
                      {["day", "month", "year"].map((tf) => (
                        <button
                          key={tf}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTimeframe(tf as "day" | "month" | "year");
                          }}
                          className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            timeframe === tf
                              ? "bg-[#9DB38A] text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          {tf.charAt(0).toUpperCase() + tf.slice(1)}
                        </button>
                      ))}
                    </div>
                    {/* Legend */}
                    {expandedChartData.some((d) => d.type === "forecast") && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0.5 bg-[#9DB38A]"></div>
                          <span className="text-gray-600">Historical Data</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg width="32" height="2" className="overflow-visible">
                            <line 
                              x1="0" 
                              y1="1" 
                              x2="32" 
                              y2="1" 
                              stroke="#9DB38A" 
                              strokeWidth="2" 
                              strokeDasharray="5,3"
                            />
                          </svg>
                          <span className="text-gray-600">AI Forecast</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full h-[500px]">
                  {expandedChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={expandedChartData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }
                          domain={['dataMin', 'dataMax']}
                          type="category"
                          allowDataOverflow={false}
                        />
                        <YAxis
                          domain={["auto", "auto"]}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Historical line */}
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={
                            liveStockDetail.change >= 0 ? "#9DB38A" : "#c17b7b"
                          }
                          strokeWidth={3}
                          dot={false}
                          connectNulls={false}
                          data={expandedChartData.map((d) =>
                            d.type !== "forecast" ? d : { ...d, price: null }
                          )}
                        />
                        
                        {/* Forecast line - clearly dashed */}
                        {expandedChartData.some((d) => d.type === "forecast") && (
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#9DB38A"
                            strokeWidth={3}
                            strokeDasharray="10 5"
                            dot={false}
                            connectNulls={false}
                            opacity={0.8}
                            data={(() => {
                              const historicalPoints = expandedChartData.filter(
                                (d) => d.type !== "forecast"
                              );
                              const lastHistorical =
                                historicalPoints[historicalPoints.length - 1];

                              return expandedChartData.map((d) => {
                                if (d === lastHistorical) return d;
                                if (d.type === "forecast") return d;
                                return { ...d, price: null };
                              });
                            })()}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Loading chart data...
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-4">
                {/* Price Metrics */}
                <div className="bg-gradient-to-br from-[#eff3eb] to-white rounded-xl p-6 border-2 border-[#9DB38A]">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Today's Range
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Open</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${formatNumber(liveStockDetail.open)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">High</span>
                      <span className="text-lg font-bold text-[#9DB38A]">
                        ${formatNumber(liveStockDetail.high)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Low</span>
                      <span className="text-lg font-bold text-[#c17b7b]">
                        ${formatNumber(liveStockDetail.low)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-300">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Volume
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {formatVolume(liveStockDetail.volume)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg: {formatVolume(liveStockDetail.avgVolume)}
                  </p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-700 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (liveStockDetail.volume / liveStockDetail.avgVolume) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Market Cap */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-300">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Market Cap
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {formatMarketCap(liveStockDetail.marketCap)}
                  </p>
                  <p className="text-sm text-gray-600">
                    P/E Ratio: {formatNumber(liveStockDetail.peRatio)}
                  </p>
                </div>

                {/* 52 Week Range */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-300">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    52 Week Range
                  </p>
                  <p className="text-sm text-gray-900 font-medium mb-3">
                    ${formatNumber(liveStockDetail.fiftyTwoWeekLow)} - $
                    {formatNumber(liveStockDetail.fiftyTwoWeekHigh)}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    {liveStockDetail.fiftyTwoWeekLow != null &&
                      liveStockDetail.fiftyTwoWeekHigh != null && (
                        <div
                          className="bg-gradient-to-r from-[#c17b7b] via-[#9DB38A] to-[#9DB38A] h-3 rounded-full relative"
                          style={{
                            width: `${
                              ((liveStockDetail.price -
                                liveStockDetail.fiftyTwoWeekLow) /
                                (liveStockDetail.fiftyTwoWeekHigh -
                                  liveStockDetail.fiftyTwoWeekLow)) *
                              100
                            }%`,
                          }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gray-900 rounded-full"></div>
                        </div>
                      )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Current: ${formatNumber(liveStockDetail.price)}
                  </p>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="bg-gradient-to-br from-[#eff3eb] to-gray-50 rounded-xl p-8 border-2 border-[#9DB38A]">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  AI-Powered Analysis
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-2">
                      Recommendation
                    </p>
                    <p
                      className={`text-4xl font-bold mb-2 ${
                        liveStockDetail.changePercent >= 0
                          ? "text-[#9DB38A]"
                          : "text-[#c17b7b]"
                      }`}
                    >
                      {liveStockDetail.changePercent >= 0 ? "BUY" : "HOLD"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Based on technical analysis
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-2">
                      Confidence Score
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mb-2">
                      {Math.min(
                        Math.abs(liveStockDetail.changePercent * 10),
                        99
                      ).toFixed(0)}
                      %
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                        className="bg-[#9DB38A] h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            Math.abs(liveStockDetail.changePercent * 10),
                            99
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-2">
                      Price Target
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mb-2">
                      $
                      {formatNumber(
                        liveStockDetail.price *
                          (1 + Math.abs(liveStockDetail.changePercent) / 100)
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      30-day forecast
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </>
  );
}