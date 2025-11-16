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

function extractPriceFromPoint(point: any): number | null {
  if (!point || typeof point !== 'object') {
    return null;
  }

  const candidateKeys = ['price', 'close', 'closing_price', 'value', 'adjClose', 'adj_close'];
  for (const key of candidateKeys) {
    const value = point[key];
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

      const rawDate =
        (point && typeof point === 'object' && 'date' in point && point.date) || null;
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

  return {
    symbol: row.symbol,
    company,
    price: round(price),
    change: round(change),
    changePercent: round(changePercent),
  };
}

async function fetchYahooSummary(symbol: string): Promise<StockSummary | null> {
  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote || quote.regularMarketPrice === undefined) {
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

    return {
      symbol,
      company: companyName,
      price: round(currentPrice),
      change: round(change),
      changePercent: round(changePercent),
    };
  } catch (error) {
    console.error(`Error fetching ${symbol} from Yahoo Finance:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Paginate symbols
    const paginatedSymbols = SYMBOLS.slice(offset, offset + limit);

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

    const missingSymbols = paginatedSymbols.filter(
      (symbol) => !cachedMap.has(symbol.toUpperCase()),
    );

    const yahooSummaries = await Promise.all(
      missingSymbols.map((symbol) => fetchYahooSummary(symbol)),
    );
    const yahooMap = new Map<string, StockSummary>();
    yahooSummaries
      .filter((summary): summary is StockSummary => summary !== null)
      .forEach((summary) => {
        yahooMap.set(summary.symbol.toUpperCase(), summary);
      });

    const stocks: StockSummary[] = [];
    paginatedSymbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      const cachedRow = cachedMap.get(upperSymbol);

      if (cachedRow) {
        const summary = buildSummaryFromSeries({
          ...cachedRow,
          symbol: upperSymbol,
        });
        if (summary) {
          stocks.push(summary);
          return;
        }
      }

      const yahooSummary = yahooMap.get(upperSymbol);
      if (yahooSummary) {
        stocks.push(yahooSummary);
      }
    });

    return NextResponse.json({
      stocks,
      total: SYMBOLS.length,
      offset,
      limit,
      hasMore: offset + limit < SYMBOLS.length,
    });
  } catch (error) {
    console.error('Error in /api/stocks:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}

