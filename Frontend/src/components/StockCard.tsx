"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
  return num != null ? num.toFixed(decimals) : "-";
};

// Helper to format volume
const formatVolume = (vol: number | undefined | null) => {
  if (!vol) return "-";
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(1) + "M";
  if (vol >= 1_000) return (vol / 1_000).toFixed(1) + "K";
  return vol.toString();
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
          <p className="text-xs text-blue-600 font-semibold mt-1">Forecast</p>
        )}
      </div>
    );
  }
  return null;
};

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
  // Note: Currently not used but kept for potential future use
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
      <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto px-8">
        <button
          onClick={goToPrevious}
          className="absolute left-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900 group-hover:text-[#9DB38A] transition-colors" />
        </button>

        <div className="relative w-full min-h-[950px] flex items-center justify-center py-8">
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
                  <div className="w-full h-64 rounded-lg bg-gray-50 border-2 border-gray-200 overflow-hidden">
                    {index === currentIndex && (
                      <div className="absolute top-2 left-2 text-xs bg-white/80 p-1 rounded z-10">
                        H:
                        {
                          combinedChartData.filter((d) => d.type !== "forecast")
                            .length
                        }
                        F:
                        {
                          combinedChartData.filter((d) => d.type === "forecast")
                            .length
                        }
                      </div>
                    )}
                    {index === currentIndex && combinedChartData.length > 0 ? (
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
                          {/* Historical line - solid */}
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke={stock.change >= 0 ? "#9DB38A" : "#c17b7b"}
                            strokeWidth={3}
                            dot={false}
                            connectNulls={true}
                            data={combinedChartData.filter((d) => d.type !== "forecast")}
                            name="Historical"
                          />
                          {/* Forecast line - dashed and more visible */}
                          {combinedChartData.some(
                            (d) => d.type === "forecast"
                          ) && (
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              strokeDasharray="8 4"
                              dot={false}
                              connectNulls={true}
                              data={combinedChartData.filter((d) => d.type === "forecast")}
                              name="Forecast"
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
                      <div className="flex items-center justify-center gap-6 mt-3 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-1.5 bg-[#9DB38A] rounded"></div>
                          <span className="text-gray-700 font-semibold">Historical</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg width="32" height="6" className="overflow-visible">
                            <line 
                              x1="0" 
                              y1="3" 
                              x2="32" 
                              y2="3" 
                              stroke="#3b82f6" 
                              strokeWidth="3" 
                              strokeDasharray="6 3"
                            />
                          </svg>
                          <span className="text-gray-700 font-semibold">Forecast</span>
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

                  <div className="col-span-1 bg-gradient-to-br from-[#eff3eb] to-blue-50 rounded-lg p-3 border-2 border-[#9DB38A] flex flex-col justify-between">
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

        <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex space-x-2 items-center">
          {stocks.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                checkAndLoadMore(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[#9DB38A] w-6"
                  : "bg-gray-400 hover:bg-gray-600"
              }`}
            />
          ))}
          {loadingMore && (
            <div className="ml-2 text-sm text-gray-500">Loading more...</div>
          )}
        </div>
      </div>

      {expandedStock && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          onClick={closeExpanded}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] p-8 relative overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeExpanded}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-3xl font-bold mb-4">
              {expandedStock.symbol} - {expandedStock.company}
            </h2>
            <p className="text-gray-600">Expanded view content here...</p>
          </div>
        </div>
      )}
    </>
  );
}
