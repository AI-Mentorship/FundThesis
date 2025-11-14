'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const axisDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

const tooltipDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

function formatAxisDate(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return axisDateFormatter.format(parsed);
}

function formatPercent(value) {
  if (Number.isNaN(value)) {
    return '0%';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0];
  const percentValue = typeof point.value === 'number' ? point.value : Number(point.value ?? 0);
  const formattedDate = label ? tooltipDateFormatter.format(new Date(label)) : '';

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-sm font-medium text-slate-600">{formattedDate}</p>
      <p className="text-lg font-semibold text-slate-800">{formatPercent(percentValue)}</p>
    </div>
  );
}

export function PortfolioPerformanceChart({ data, loading = false, error = null, className = '' }) {
  if (loading) {
    return (
      <div className={`flex h-64 items-center justify-center bg-slate-50 ${className}`}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-64 items-center justify-center bg-slate-50 ${className}`}>
        <p className="text-sm text-slate-600">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex h-64 items-center justify-center bg-slate-50 ${className}`}>
        <p className="text-sm text-slate-600">No portfolio performance data available yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#cbd5f5' }}
            tickFormatter={formatAxisDate}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#cbd5f5' }}
            tickFormatter={formatPercent}
            width={72}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="percentChange"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


