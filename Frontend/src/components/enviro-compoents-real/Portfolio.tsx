'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState, useMemo } from 'react';
import clsx from 'clsx';

export interface PortfolioHistoryPoint {
  timestamp: Date;
  value: number;
}

interface PortfolioChartProps {
  portfolioHistory: PortfolioHistoryPoint[];
}

const timeRanges = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: 'YTD', type: 'ytd' as const },
  { label: '1Y', days: 365 },
  { label: 'ALL', type: 'all' as const },
];

export function PortfolioChart({ portfolioHistory }: PortfolioChartProps) {
  const [selectedRange, setSelectedRange] = useState('1W');

  const now = new Date();

  // Filter data based on selected range
  const filteredData = useMemo(() => {
    const range = timeRanges.find((r) => r.label === selectedRange);
    if (!range) return portfolioHistory;

    if (range.type === 'all') return portfolioHistory;

    if (range.type === 'ytd') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return portfolioHistory.filter((point) => point.timestamp >= startOfYear);
    }

    const cutoff = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000);
    return portfolioHistory.filter((point) => point.timestamp >= cutoff);
  }, [selectedRange, portfolioHistory]);

  const chartData = filteredData.map((point) => ({
    time: point.timestamp.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    value: point.value,
    timestamp: point.timestamp,
  }));

  const minValue = Math.min(...chartData.map((d) => d.value));
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const initialValue = chartData[0]?.value ?? 0;
  const currentValue = chartData[chartData.length - 1]?.value ?? 0;
  const totalChange = currentValue - initialValue;
  const totalChangePercent = initialValue !== 0 ? (totalChange / initialValue) * 100 : 0;
  const isPositive = totalChange >= 0;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: Date; value: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border rounded-lg p-3 shadow-md text-sm">
          <p className="text-gray-500">
            {data.timestamp.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="font-semibold">
            ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
      </div>
      {/*max-w-[50%] min-w-[300px] */}
      {/* Card-like container <div className="w-full max-w-3xl mx-auto">*/}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-bold">
            ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div
            className={clsx(
              'text-sm font-medium',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {isPositive ? '+' : ''}
            ${totalChange.toLocaleString(undefined, { minimumFractionDigits: 2 })} (
            {isPositive ? '+' : ''}
            {totalChangePercent.toFixed(2)}%)
          </div>
        </div>

        <div className="h-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                domain={[minValue * 0.999, maxValue * 1.001]}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#16a34a' : '#dc2626'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time range buttons */}
      <div className="mt-4 flex justify-center gap-7 flex-wrap w-full">
        {timeRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => setSelectedRange(range.label)}
            className={clsx(
              'px-3 py-1 text-sm rounded-md border',
              selectedRange === range.label
                ? 'bg-black text-white'
                : 'text-gray-600 border-gray-300 hover:bg-gray-100'
            )}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
