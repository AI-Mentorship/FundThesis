import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();
const DEFAULT_LOOKBACK_DAYS = 90;

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching authenticated user:', userError.message);
      return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: userAccountRows,
      error: userAccountError,
    } = await supabase.from('user_account').select('*').eq('user_id', user.id);

    if (userAccountError) {
      console.error('Error fetching user tickers:', userAccountError.message);
      return NextResponse.json({ error: 'Failed to load user tickers' }, { status: 500 });
    }

    if (!userAccountRows || userAccountRows.length === 0) {
      return NextResponse.json({ tickers: [], performance: [] });
    }

    const tickers = extractTickers(userAccountRows);

    if (tickers.length === 0) {
      return NextResponse.json({ tickers: [], performance: [] });
    }

    const histories = await loadHistories(supabase, tickers);
    const performance = computePortfolioPerformance(histories);
    const summary = buildSummary(performance);

    return NextResponse.json({
      tickers,
      performance,
      summary,
    });
  } catch (error) {
    console.error('Unexpected error loading portfolio performance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching authenticated user:', userError.message);
      return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rawTicker = typeof body?.ticker === 'string' ? body.ticker : '';
    const ticker = rawTicker.trim().toUpperCase();

    if (ticker.length === 0) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    const {
      data: existingRows,
      error: existingError,
    } = await supabase
      .from('user_account')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('stock_ticker', ticker)
      .limit(1);

    if (existingError) {
      console.error('Error checking existing ticker:', existingError.message);
      return NextResponse.json({ error: 'Failed to verify existing tickers' }, { status: 500 });
    }

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return NextResponse.json(
        { success: true, ticker, message: 'Ticker already exists in portfolio' },
        { status: 200 },
      );
    }

    const { error: insertError } = await supabase
      .from('user_account')
      .insert({ user_id: user.id, stock_ticker: ticker });

    if (insertError) {
      console.error('Error adding ticker to user_account:', insertError.message);
      return NextResponse.json({ error: 'Failed to add ticker' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ticker });
  } catch (error) {
    console.error('Unexpected error adding ticker:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function extractTickers(rows) {
  const tickerSet = new Set();

  rows.forEach((row) => {
    if (typeof row.stock_ticker === 'string' && row.stock_ticker.trim().length > 0) {
      tickerSet.add(row.stock_ticker.trim().toUpperCase());
    }

    if (typeof row.ticker === 'string' && row.ticker.trim().length > 0) {
      tickerSet.add(row.ticker.trim().toUpperCase());
    }

    if (Array.isArray(row.tickers)) {
      row.tickers
        .filter((value) => typeof value === 'string' && value.trim().length > 0)
        .forEach((value) => tickerSet.add(value.trim().toUpperCase()));
    }
  });

  return Array.from(tickerSet.values());
}

async function loadHistories(supabase, tickers) {
  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const cached = await fetchCachedPrices(supabase, ticker);

      if (cached.length > 0) {
        return [ticker, cached.sort((a, b) => a.date.localeCompare(b.date))];
      }

      const downloaded = await downloadAndCachePrices(supabase, ticker);
      return [ticker, downloaded];
    }),
  );

  return Object.fromEntries(results);
}

async function fetchCachedPrices(supabase, ticker) {
  const { data, error } = await supabase
    .from('price_data')
    .select('ticker, date, close')
    .eq('ticker', ticker)
    .order('date', { ascending: true });

  if (error) {
    console.error(`Error fetching cached price data for ${ticker}:`, error.message);
    return [];
  }

  return (data ?? []).map((entry) => ({
    ticker,
    date: entry.date,
    close: typeof entry.close === 'number' ? entry.close : Number(entry.close ?? 0),
  }));
}

async function downloadAndCachePrices(supabase, ticker) {
  try {
    const historical = await yahooFinance.historical(ticker, {
      period1: new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000),
      period2: new Date(),
      interval: '1d',
    });

    if (!Array.isArray(historical) || historical.length === 0) {
      console.warn(`No historical data returned for ${ticker}`);
      return [];
    }

    const priceRows = historical
      .map((item) => {
        if (typeof item.close !== 'number' || Number.isNaN(item.close)) {
          return null;
        }

        const date = normaliseDate(item.date);
        if (!date) {
          return null;
        }

        return {
          ticker,
          date,
          close: Number(item.close),
        };
      })
      .filter((row) => row !== null)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (priceRows.length === 0) {
      return [];
    }

    const { error: insertError } = await supabase
      .from('price_data')
      .upsert(priceRows, { onConflict: 'ticker,date', ignoreDuplicates: true });

    if (insertError) {
      console.error(`Failed to cache price data for ${ticker}:`, insertError.message);
    }

    return priceRows;
  } catch (error) {
    console.error(`Error downloading price data for ${ticker}:`, error);
    return [];
  }
}

function computePortfolioPerformance(histories) {
  const dateMap = new Map();

  Object.values(histories).forEach((rows) => {
    if (!rows || rows.length === 0) {
      return;
    }

    const baseline = rows[0]?.close ?? 0;

    if (!baseline || baseline <= 0) {
      return;
    }

    rows.forEach((row) => {
      const percentChange = ((row.close - baseline) / baseline) * 100;
      const entry = dateMap.get(row.date);

      if (entry) {
        entry.totalPercent += percentChange;
        entry.count += 1;
      } else {
        dateMap.set(row.date, {
          totalPercent: percentChange,
          count: 1,
        });
      }
    });
  });

  return Array.from(dateMap.entries())
    .map(([date, { totalPercent, count }]) => ({
      date,
      percentChange: count > 0 ? totalPercent / count : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildSummary(performance) {
  if (performance.length === 0) {
    return null;
  }

  const lastPoint = performance[performance.length - 1];
  const latestPercent = lastPoint.percentChange;
  const latestValue = 100 * (1 + latestPercent / 100);

  const dailyChange = deltaFromOffset(performance, 1);
  const weeklyChange = deltaFromOffset(performance, 5);
  const monthlyChange = deltaFromOffset(performance, 21);

  return {
    latestPercent,
    latestValue,
    dailyChange,
    weeklyChange,
    monthlyChange,
  };
}

function deltaFromOffset(performance, offset) {
  if (performance.length <= offset) {
    return 0;
  }

  const latest = performance[performance.length - 1]?.percentChange ?? 0;
  const previous = performance[performance.length - 1 - offset]?.percentChange ?? latest;
  return latest - previous;
}

function normaliseDate(input) {
  if (!input) {
    return null;
  }

  if (input instanceof Date) {
    return input.toISOString().split('T')[0];
  }

  if (typeof input === 'string') {
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }

  return null;
}



