import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import YahooFinance from 'yahoo-finance2';
import path from 'path';
import { spawn } from 'child_process';

type PriceSeriesPoint = {
  date: string;
  price: number;
};

type StockPriceSeriesRow = {
  symbol: string;
  price_series: unknown;
  forecast_results?: unknown;
  metadata?: Record<string, unknown> | null;
};

// Create a singleton instance
const yahooFinance = new YahooFinance();
const PYTHON_EXECUTABLE = process.env.PYTHON_PATH || 'python';
const FORECAST_SCRIPT_PATH = path.join(
  process.cwd(),
  'backend',
  'stock_api',
  'generate_forecast_cli.py',
);

function coerceToArray(input: unknown): unknown[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return coerceToArray(parsed);
    } catch (error) {
      console.warn('Failed to parse JSON string for price series/forecast:', error);
      return [];
    }
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const candidateKeys = [
      'price_series',
      'series',
      'data',
      'values',
      'prices',
      'historical',
      'points',
      'entries',
      'items',
      'forecast',
      'forecasts',
    ];

    for (const key of candidateKeys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as unknown[];
      }
    }
  }

  return [];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function extractPriceFromPoint(point: any): number | null {
  if (!point || typeof point !== 'object') {
    return null;
  }

  const candidateKeys = [
    'price',
    'Price',
    'close',
    'Close',
    'closing_price',
    'Closing_Price',
    'value',
    'Value',
    'adjClose',
    'adj_close',
    'AdjClose',
  ];

  for (const key of candidateKeys) {
    const value = (point as Record<string, unknown>)[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function normaliseSeries(series: unknown): PriceSeriesPoint[] {
  const source = coerceToArray(series);

  if (source.length === 0) {
    return [];
  }

  return source
    .map((point) => {
      // First try to extract price from the point directly
      let price = extractPriceFromPoint(point);
      
      // If that fails, try to get it from OHLCV format (your data format)
      if (price === null && point && typeof point === 'object') {
        const obj = point as Record<string, unknown>;
        // Try Close, close, or other variations
        if (typeof obj.Close === 'number') price = obj.Close;
        else if (typeof obj.close === 'number') price = obj.close;
      }
      
      if (price === null) {
        return null;
      }

      const rawDate =
        (point &&
          typeof point === 'object' &&
          (('date' in point && (point as any).date) ||
            ('Date' in point && (point as any).Date))) ||
        null;
      const dateValue = rawDate ? new Date(rawDate as string | number | Date) : null;

      if (!dateValue || Number.isNaN(dateValue.getTime())) {
        return null;
      }

      return {
        date: dateValue.toISOString().split('T')[0],
        price,
      } satisfies PriceSeriesPoint;
    })
    .filter((point): point is PriceSeriesPoint => point !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}
function normaliseForecastSeries(data: unknown): PriceSeriesPoint[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return normaliseSeries(data);
  }

  return normaliseSeries(coerceToArray(data));
}

function filterSeriesByDays(series: PriceSeriesPoint[], days: number): PriceSeriesPoint[] {
  if (!Number.isFinite(days) || days <= 0) {
    return series;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return series.filter((point) => {
    const pointDate = new Date(point.date);
    if (Number.isNaN(pointDate.getTime())) {
      return false;
    }
    return pointDate >= cutoff;
  });
}

async function runPythonForecast(symbol: string): Promise<PriceSeriesPoint[] | null> {
  return new Promise((resolve) => {
    const child = spawn(PYTHON_EXECUTABLE, [FORECAST_SCRIPT_PATH, symbol], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      console.error(`Failed to execute forecast helper for ${symbol}:`, error);
      resolve(null);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        if (stderr.trim().length > 0) {
          console.error(`Forecast helper stderr for ${symbol}: ${stderr}`);
        }
        console.error(`Forecast helper exited with code ${code} for ${symbol}`);
        resolve(null);
        return;
      }

      try {
        const trimmed = stdout.trim();
        if (trimmed.length === 0) {
          resolve(null);
          return;
        }

        const payload = JSON.parse(trimmed);
        if (!payload || !Array.isArray(payload.forecast)) {
          resolve(null);
          return;
        }

        const normalized = payload.forecast
          .map((item: Record<string, unknown>) => {
            const rawDate =
              (typeof item.date === 'string' && item.date) ||
              (typeof item.Date === 'string' && item.Date);
            const rawPrice =
              typeof item.price === 'number'
                ? item.price
                : typeof item.price === 'string'
                  ? Number(item.price)
                  : typeof item.Predicted_Close === 'number'
                    ? item.Predicted_Close
                    : typeof item.Predicted_Close === 'string'
                      ? Number(item.Predicted_Close)
                      : null;

            if (!rawDate || rawPrice === null || Number.isNaN(rawPrice)) {
              return null;
            }

            return {
              date: rawDate,
              price: Number(rawPrice),
            } satisfies PriceSeriesPoint;
          })
          .filter((point: PriceSeriesPoint | null): point is PriceSeriesPoint => point !== null);

        if (normalized.length === 0) {
          resolve(null);
          return;
        }

        resolve(normalized);
      } catch (error) {
        console.error(`Failed to parse forecast helper output for ${symbol}:`, error);
        resolve(null);
      }
    });
  });
}

async function generateAndCacheForecast(
  supabase: SupabaseClient<any, any, any>,
  symbol: string,
  hasExistingRow: boolean,
): Promise<PriceSeriesPoint[] | null> {
  const forecast = await runPythonForecast(symbol);

  if (!forecast || forecast.length === 0) {
    return null;
  }

  try {
    if (hasExistingRow) {
      const { error } = await supabase
        .from('stock_price_series')
        .update({ forecast_results: forecast })
        .eq('symbol', symbol);

      if (error) {
        console.error(`Failed to update forecast cache for ${symbol}:`, error.message);
      }
    } else {
      const { error } = await supabase
        .from('stock_price_series')
        .upsert({ symbol, forecast_results: forecast }, { onConflict: 'symbol' });

      if (error) {
        console.error(`Failed to upsert forecast cache for ${symbol}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Unexpected error caching forecast for ${symbol}:`, error);
  }

  return forecast;
}

async function ensureForecastData(
  supabase: SupabaseClient<any, any, any>,
  symbol: string,
  row: StockPriceSeriesRow | null,
): Promise<PriceSeriesPoint[] | null> {
  const existing = normaliseForecastSeries(row?.forecast_results);
  if (existing.length > 0) {
    return existing;
  }

  return generateAndCacheForecast(supabase, symbol, Boolean(row));
}

function extractCompanyName(row: StockPriceSeriesRow, fallbackSymbol: string): string {
  return row.symbol;
}

function extractNumber(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = 0,
): number {
  if (!source || typeof source !== 'object') {
    return fallback;
  }

  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function extractString(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback: string,
): string {
  if (!source || typeof source !== 'object') {
    return fallback;
  }

  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return fallback;
}

function buildResponseFromCached(
  row: StockPriceSeriesRow,
  symbol: string,
  days: number,
): Record<string, unknown> | null {
  const series = normaliseSeries(row.price_series);
  if (series.length === 0) {
    return null;
  }

  const filteredSeries = filterSeriesByDays(series, days);
  const historicalSeries = filteredSeries.length > 0 ? filteredSeries : series;

  const latest = historicalSeries[historicalSeries.length - 1] ?? series[series.length - 1];
  const previous =
    series.length > 1
      ? series[series.length - 2]
      : historicalSeries.length > 1
        ? historicalSeries[historicalSeries.length - 2]
        : latest;

  const price = latest.price;
  const previousPrice = previous?.price ?? price;
  const change = price - previousPrice;
  const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

  const open = historicalSeries[0]?.price ?? price;
  const high = historicalSeries.reduce((max, point) => Math.max(max, point.price), price);
  const low = historicalSeries.reduce((min, point) => Math.min(min, point.price), price);

  const fullPeriodHigh = series.reduce((max, point) => Math.max(max, point.price), price);
  const fullPeriodLow = series.reduce((min, point) => Math.min(min, point.price), price);

  const metadata = row.metadata ?? null;

  const volume = extractNumber(metadata, ['volume', 'regular_market_volume'], 0);
  const avgVolume = extractNumber(metadata, ['avgVolume', 'average_volume'], 0);
  const marketCap = extractNumber(metadata, ['market_cap', 'marketCap'], 0);
  const peRatio = extractNumber(metadata, ['pe_ratio', 'peRatio', 'trailingPE'], 0);
  const dividendYield = extractNumber(
    metadata,
    ['dividend_yield', 'dividendYield'],
    0,
  );

  const sector = extractString(metadata, ['sector'], 'N/A');
  const industry = extractString(metadata, ['industry'], 'N/A');

  const company = extractCompanyName(row, symbol);

  const forecastSeries = normaliseForecastSeries(row.forecast_results);

  return {
    symbol,
    company,
    price: round(price),
    change: round(change),
    changePercent: round(changePercent),
    open: round(open),
    high: round(high),
    low: round(low),
    volume,
    avgVolume,
    fiftyTwoWeekHigh: round(fullPeriodHigh),
    fiftyTwoWeekLow: round(fullPeriodLow),
    marketCap,
    peRatio: round(peRatio),
    dividendYield,
    sector,
    industry,
    chartData: historicalSeries.map((point) => ({
      date: point.date,
      price: round(point.price),
    })),
    forecastData: forecastSeries.map((point) => ({
      date: point.date,
      price: round(point.price),
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  try {
    const { symbol: symbolParam } = await params;
    const rawSymbol = symbolParam.trim();
    const symbol = rawSymbol.toUpperCase();
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);

    console.log(`📊 Fetching stock detail for ${symbol}...`);

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore as unknown as ReturnType<typeof cookies>,
    });
    const {
      data: cachedRows,
      error: cachedError,
    } = await supabase
      .from('stock_price_series')
      .select('symbol, price_series, forecast_results,')
      .in('symbol', [symbol, rawSymbol]);

    if (cachedError) {
      console.error(`Error loading cached stock series for ${symbol}:`, cachedError.message);
    }

    const cachedRow =
      Array.isArray(cachedRows) && cachedRows.length > 0 ? (cachedRows[0] as unknown) : null;

    let row: StockPriceSeriesRow | null = cachedRow ? (cachedRow as StockPriceSeriesRow) : null;
    const ensuredForecast = await ensureForecastData(supabase, symbol, row);

    if (row && ensuredForecast) {
      row = { ...row, forecast_results: ensuredForecast };
    }

    if (row) {
      const priceSeriesPreview = Array.isArray(row.price_series)
        ? row.price_series.length
        : typeof row.price_series === 'string'
          ? row.price_series.length
          : 0;
      console.log(
        `✅ Supabase cache hit for ${symbol}: price_series length ${priceSeriesPreview}`,
      );
      const cachedResponse = buildResponseFromCached(row, symbol, days);

      if (cachedResponse) {
        console.log(`✅ Returning cached stock data for ${symbol}`);
        return NextResponse.json(cachedResponse);
      }
    }

    // Fallback to Yahoo Finance if cache is missing or invalid
    const quoteResult = await yahooFinance.quote(symbol);

    if (!quoteResult) {
      return NextResponse.json({ error: 'No data available for this symbol' }, { status: 404 });
    }

    const quote = quoteResult as {
      regularMarketPrice?: number;
      regularMarketOpen?: number;
      regularMarketDayHigh?: number;
      regularMarketDayLow?: number;
      regularMarketVolume?: number;
      averageVolume?: number;
      fiftyTwoWeekHigh?: number;
      fiftyTwoWeekLow?: number;
      marketCap?: number;
      trailingPE?: number;
      dividendYield?: number;
      sector?: string;
      industry?: string;
      longName?: string;
      shortName?: string;
    };

    let historical: Array<{ date?: Date | string; close?: number; volume?: number }> = [];
    try {
      const interval = days <= 30 ? '1d' : days <= 365 ? '1d' : '1wk';
      const historicalResult = await yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: interval as '1d' | '1wk' | '1mo',
      });
      historical = Array.isArray(historicalResult) ? historicalResult : [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      historical = [];
    }

    if (historical.length === 0) {
      return NextResponse.json(
        { error: 'No historical data available for this symbol' },
        { status: 404 },
      );
    }

    const currentPrice = quote.regularMarketPrice || 0;
    const openPrice = quote.regularMarketOpen || currentPrice;
    const change = currentPrice - openPrice;
    const changePercent = openPrice !== 0 ? (change / openPrice) * 100 : 0;

    const chartData = historical.map(
      (item: { date?: Date | string; close?: number; volume?: number }) => ({
        date:
          item.date instanceof Date
            ? item.date.toISOString().split('T')[0]
            : String(item.date || ''),
        price: round(item.close || 0),
        volume: item.volume || 0,
      }),
    );

    console.log(`✅ Historical data from Yahoo: ${chartData.length} points`);

    const fallbackForecastData = (ensuredForecast ?? []).map((point) => ({
      date: point.date,
      price: round(point.price),
    }));

    if (!row) {
      console.log(`⚠️ No Supabase cache row found for ${symbol}; served Yahoo Finance data`);
    } else {
      console.log(
        `⚠️ Supabase cache for ${symbol} missing price series; served Yahoo Finance data`,
      );
    }

    const responseData = {
      symbol,
      company: quote.longName || quote.shortName || symbol,
      price: round(currentPrice),
      change: round(change),
      changePercent: round(changePercent),
      open: round(quote.regularMarketOpen || 0),
      high: round(quote.regularMarketDayHigh || quote.fiftyTwoWeekHigh || 0),
      low: round(quote.regularMarketDayLow || quote.fiftyTwoWeekLow || 0),
      volume: quote.regularMarketVolume || 0,
      avgVolume: quote.averageVolume || 0,
      fiftyTwoWeekHigh: round(quote.fiftyTwoWeekHigh || 0),
      fiftyTwoWeekLow: round(quote.fiftyTwoWeekLow || 0),
      marketCap: quote.marketCap || 0,
      peRatio: quote.trailingPE ? round(quote.trailingPE) : 0,
      dividendYield: quote.dividendYield || 0,
      sector: quote.sector || 'N/A',
      industry: quote.industry || 'N/A',
      chartData,
      forecastData: fallbackForecastData,
    };

    console.log(`🎉 Response ready for ${symbol} (Yahoo fallback)`);
    return NextResponse.json(responseData);
  } catch (error) {
    const { symbol: symbolParam } = await params;
    console.error(`❌ Error fetching ${symbolParam}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

