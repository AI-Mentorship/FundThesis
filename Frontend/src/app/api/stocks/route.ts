import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import YahooFinance from 'yahoo-finance2';

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

type StockSummary = {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  forecastData: PriceSeriesPoint[];
};

// Create a singleton instance
const yahooFinance = new YahooFinance();

// Extended list of symbols (matching the Python server)
const SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 
  'JPM', 'BAC', 'GS', 'WFC', 'C', 'JNJ', 'UNH', 'PFE', 'ABBV', 'TMO',
  'WMT', 'HD', 'DIS', 'NKE', 'SBUX', 'XOM', 'CVX', 'COP', 'BA', 'CAT', 
  'GE', 'T', 'VZ', 'CMCSA', 'INTC', 'AMD', 'QCOM', 'AVGO', 'TXN', 'MU',
  'V', 'MA', 'PYPL', 'AXP', 'SQ', 'BLK', 'SCHW', 'MS', 'SPGI', 'ICE',
  'KO', 'PEP', 'COST', 'MCD', 'MDLZ', 'PM', 'MO', 'CL', 'PG', 'UL',
  'ADBE', 'CRM', 'ORCL', 'NOW', 'INTU', 'SHOP', 'SNOW', 'DDOG', 'ZM', 'TEAM',
  'UPS', 'FDX', 'DAL', 'LUV', 'UAL', 'AAL', 'MAR', 'HLT', 'RCL', 'CCL',
  'HON', 'RTX', 'LMT', 'NOC', 'GD', 'BA', 'DE', 'EMR', 'ITW', 'MMM',
  'BMY', 'LLY', 'MRK', 'GILD', 'AMGN', 'BIIB', 'REGN', 'VRTX', 'ILMN', 'ALXN',
  'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'PEG', 'XEL', 'ED',
  'LOW', 'TGT', 'TJX', 'ROST', 'DG', 'DLTR', 'BBY', 'EBAY', 'ETSY', 'W',
  'F', 'GM', 'TM', 'HMC', 'RACE', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI',
  'BABA', 'JD', 'PDD', 'BIDU', 'TCEHY', 'SE', 'MELI', 'GRAB', 'DIDI', 'CPNG',
  'UBER', 'LYFT', 'ABNB', 'DASH', 'SPOT', 'RBLX', 'U', 'PINS', 'SNAP', 'TWTR',
  'DHR', 'ABT', 'SYK', 'BSX', 'MDT', 'ISRG', 'EW', 'ZBH', 'BAX', 'BDX',
  'WBA', 'CVS', 'CI', 'HUM', 'ANTM', 'CNC', 'MOH', 'ELV', 'HCA', 'UHS',
  'NXPI', 'MRVL', 'LRCX', 'KLAC', 'AMAT', 'ADI', 'MCHP', 'SWKS', 'QRVO', 'SLAB',
  'CMG', 'YUM', 'QSR', 'DPZ', 'WING', 'DNUT', 'JACK', 'WEN', 'SONO', 'CAKE',
  'SLB', 'HAL', 'BKR', 'NOV', 'FTI', 'HP', 'RIG', 'VAL', 'MRO', 'DVN'
];

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function extractPriceFromPoint(point: unknown): number | null {
  if (!point || typeof point !== 'object') {
    return null;
  }

  const record = point as Record<string, unknown>;
  // Include both lowercase and uppercase variants to handle different data formats
  const candidateKeys = ['price', 'Price', 'close', 'Close', 'closing_price', 'value', 'adjClose', 'adj_close', 'AdjClose'];
  for (const key of candidateKeys) {
    const value = record[key];
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

function normalisePriceSeries(series: unknown): PriceSeriesPoint[] {
  if (!Array.isArray(series)) {
    return [];
  }

  return series
    .map((point) => {
      const price = extractPriceFromPoint(point);
      if (price === null) {
        return null;
      }

      // Handle both lowercase 'date' and uppercase 'Date' keys
      const rawDate =
        point && typeof point === 'object'
          ? ((point as Record<string, unknown>).date ?? (point as Record<string, unknown>).Date ?? null)
          : null;
      const dateValue = rawDate ? new Date(rawDate as string | number | Date) : null;

      if (!dateValue || Number.isNaN(dateValue.getTime())) {
        return null;
      }

      return {
        date: dateValue.toISOString().split('T')[0],
        price,
      } satisfies PriceSeriesPoint;
    })
    .filter((point): point is PriceSeriesPoint => point !== null);
}

function extractCompanyName(row: StockPriceSeriesRow, symbol: string): string {
  const metadata = row.metadata;
  if (metadata && typeof metadata === 'object') {
    const record = metadata as Record<string, unknown>;
    const candidateKeys = [
      'company',
      'company_name',
      'name',
      'companyName',
      'longName',
      'shortName',
      'title',
    ];

    for (const key of candidateKeys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  return `${symbol} Inc.`;
}

function normaliseForecastSeries(series: unknown): PriceSeriesPoint[] {
  if (!Array.isArray(series)) {
    return [];
  }

  return series
    .map((point) => {
      if (!point || typeof point !== 'object') {
        return null;
      }

      const record = point as Record<string, unknown>;
      const rawDate = record.date ?? record.Date ?? null;
      const rawPrice =
        record.price ??
        record.Price ??
        record.value ??
        record.prediction ??
        record.Predicted_Close ??
        null;

      if (!rawDate) {
        return null;
      }

      const date = new Date(rawDate as string | number | Date);
      if (Number.isNaN(date.getTime())) {
        return null;
      }

      const value =
        typeof rawPrice === 'number'
          ? rawPrice
          : typeof rawPrice === 'string'
            ? Number(rawPrice)
            : null;

      if (value === null || Number.isNaN(value)) {
        return null;
      }

      return {
        date: date.toISOString().split('T')[0],
        price: Number(value),
      } satisfies PriceSeriesPoint;
    })
    .filter((point): point is PriceSeriesPoint => point !== null);
}

function buildSummaryFromSeries(row: StockPriceSeriesRow): StockSummary | null {
  const series = normalisePriceSeries(row.price_series);
  if (series.length === 0) {
    return null;
  }

  const latest = series[series.length - 1];
  const previous = series.length > 1 ? series[series.length - 2] : latest;

  const price = latest.price;
  const previousPrice = previous?.price ?? price;
  const change = price - previousPrice;
  const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

  const company = extractCompanyName(row, row.symbol);

  const forecastData = normaliseForecastSeries(row.forecast_results);

  return {
    symbol: row.symbol,
    company,
    price: round(price),
    change: round(change),
    changePercent: round(changePercent),
    forecastData,
  };
}

async function fetchYahooSummary(symbol: string): Promise<StockSummary | null> {
  try {
    console.log(`🌐 Fetching Yahoo quote for ${symbol}...`);
    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      console.log(`⚠️ No quote returned for ${symbol}`);
      return null;
    }
    
    if (quote.regularMarketPrice === undefined) {
      console.log(`⚠️ No regularMarketPrice for ${symbol}, quote:`, JSON.stringify(quote).slice(0, 200));
      return null;
    }

    const currentPrice = quote.regularMarketPrice;
    const openPrice = quote.regularMarketOpen || currentPrice;
    const change = currentPrice - openPrice;
    const changePercent = openPrice !== 0 ? (change / openPrice) * 100 : 0;

    const companyName =
      (quote.longName && typeof quote.longName === 'string' && quote.longName.length > 0
        ? quote.longName
        : quote.shortName) || `${symbol} Inc.`;

    console.log(`✅ Yahoo quote for ${symbol}: $${currentPrice} (${companyName})`);

    return {
      symbol,
      company: companyName,
      price: round(currentPrice),
      change: round(change),
      changePercent: round(changePercent),
      forecastData: [],
    };
  } catch (error) {
    console.error(`❌ Error fetching ${symbol} from Yahoo Finance:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const symbolsParam = searchParams.get('symbols');

    console.log(`📥 Received symbols param: "${symbolsParam}"`);

    const customSymbols = symbolsParam
      ? Array.from(
          new Set(
            symbolsParam
              .split(',')
              .map((symbol) => symbol.trim().toUpperCase())
              .filter((symbol) => symbol.length > 0),
          ),
        )
      : null;
    
    console.log(`📥 Parsed custom symbols: ${customSymbols ? customSymbols.join(', ') : 'none'}`);

    const paginatedSymbols =
      customSymbols && customSymbols.length > 0
        ? customSymbols
        : SYMBOLS.slice(offset, offset + limit);

    if (paginatedSymbols.length === 0) {
      return NextResponse.json({
        stocks: [],
        total: customSymbols ? 0 : SYMBOLS.length,
        offset: customSymbols ? 0 : offset,
        limit: customSymbols ? 0 : limit,
        hasMore: false,
      });
    }

    const responseOffset = customSymbols ? 0 : offset;
    const responseLimit = customSymbols ? paginatedSymbols.length : limit;
    const responseTotal = customSymbols ? customSymbols.length : SYMBOLS.length;
    const responseHasMore = customSymbols ? false : offset + limit < SYMBOLS.length;

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore as unknown as ReturnType<typeof cookies>,
    });

    const {
      data: cachedRows,
      error: cachedError,
    } = await supabase
      .from('stock_price_series')
      .select('symbol, price_series, forecast_results')
      .in('symbol', paginatedSymbols);

    if (cachedError) {
      console.error('Error fetching cached stock price series:', cachedError.message);
    }

    const cachedMap = new Map<string, StockPriceSeriesRow>();
    (cachedRows ?? []).forEach((row) => {
      if (row && typeof row.symbol === 'string') {
        cachedMap.set(row.symbol.toUpperCase(), row as StockPriceSeriesRow);
      }
    });

    console.log(`📊 Cached rows found: ${cachedMap.size} for symbols: ${paginatedSymbols.join(', ')}`);

    // First, try to build summaries from cached data
    const stocks: StockSummary[] = [];
    const symbolsNeedingYahoo: string[] = [];

    paginatedSymbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      const cachedRow = cachedMap.get(upperSymbol);

      if (cachedRow) {
        const summary = buildSummaryFromSeries({
          ...cachedRow,
          symbol: upperSymbol,
        });
        if (summary) {
          console.log(`✅ Built summary from cache for ${upperSymbol}`);
          stocks.push(summary);
          return;
        } else {
          console.log(`⚠️ Failed to build summary from cache for ${upperSymbol}, will try Yahoo`);
        }
      }
      
      // Need to fetch from Yahoo
      symbolsNeedingYahoo.push(upperSymbol);
    });

    console.log(`🌐 Fetching ${symbolsNeedingYahoo.length} symbols from Yahoo: ${symbolsNeedingYahoo.join(', ')}`);

    // Fetch missing symbols from Yahoo Finance
    const yahooSummaries = await Promise.all(
      symbolsNeedingYahoo.map((symbol) => fetchYahooSummary(symbol)),
    );

    yahooSummaries.forEach((summary) => {
      if (summary) {
        console.log(`✅ Got Yahoo data for ${summary.symbol}`);
        stocks.push({
          ...summary,
          forecastData: [],
        });
      }
    });

    console.log(`📈 Total stocks to return: ${stocks.length}`);

    return NextResponse.json({
      stocks,
      total: responseTotal,
      offset: responseOffset,
      limit: responseLimit,
      hasMore: responseHasMore,
    });
  } catch (error) {
    console.error('Error in /api/stocks:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}

