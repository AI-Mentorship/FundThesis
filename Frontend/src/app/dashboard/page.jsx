'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { NewsSection } from '@/components/dashboard/NewsSection';
import { PerformersSection } from '@/components/dashboard/PerformersSection';
import { IndexesSection } from '@/components/dashboard/IndexesSection';
import { TechnicalModelsSection } from '@/components/dashboard/TechnicalModelsSection';
import { PortfolioPerformanceChart } from '@/components/dashboard/PortfolioPerformanceChart';
import { useAuth } from '@/providers/AuthProvider';

const NEWS_ITEMS = [
  {
    title: 'Fed Signals Potential Rate Cuts in Q2',
    source: 'Reuters • 2 hours ago',
    text: 'Federal Reserve officials indicated they may begin reducing interest rates as early as the second quarter, citing moderating inflation and stable employment data.',
    stocks: [
      { symbol: 'AAPL', change: '+1.41%', positive: true },
      { symbol: 'MSFT', change: '-0.30%', positive: false },
      { symbol: 'NVDA', change: '+1.45%', positive: true },
      { symbol: 'TSLA', change: '+2.37%', positive: true },
    ],
  },
  {
    title: 'Tech Sector Shows Strong Q4 Earnings',
    source: 'Bloomberg • 4 hours ago',
    text: 'Major technology companies reported better-than-expected quarterly results, driven by AI and cloud computing demand.',
    stocks: [
      { symbol: 'GOOGL', change: '+2.32%', positive: true },
      { symbol: 'AMZN', change: '-0.51%', positive: false },
      { symbol: 'META', change: '-0.61%', positive: false },
    ],
  },
];

const PERFORMERS = [
  { rank: 1, symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$875.40', change: '+12.50', percent: '+1.45%' },
  { rank: 2, symbol: 'TSLA', name: 'Tesla Inc.', price: '$248.50', change: '+5.75', percent: '+2.37%' },
  { rank: 3, symbol: 'AAPL', name: 'Apple Inc.', price: '$180.25', change: '+2.50', percent: '+1.41%' },
  { rank: 4, symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$140.80', change: '+3.20', percent: '+2.32%' },
  { rank: 5, symbol: 'JPM', name: 'JPMorgan Chase', price: '$210.80', change: '+1.20%', percent: '+0.57%' },
];

const INDEXES = [
  { color: 'bg-blue-500', name: 'HealthThesis', description: 'Overall stock market health indicator' },
  { color: 'bg-blue-600', name: 'LongThesis', description: 'Long-term market strength signal' },
  { color: 'bg-purple-500', name: 'ShortThesis', description: 'Short-term market momentum indicator' },
];

function formatPercent(value) {
  if (Number.isNaN(value)) {
    return '0.00%';
  }
  const fixed = value.toFixed(2);
  return `${value >= 0 ? '+' : ''}${fixed}%`;
}

function formatIndexValue(value) {
  return `Index ${value.toFixed(2)}`;
}

function buildStats(summary) {
  if (!summary) {
    return [
      {
        label: 'Daily Change',
        value: '—',
        description: 'Change vs previous trading day',
        positive: true,
        icon: TrendingUp,
      },
      {
        label: 'Weekly Change',
        value: '—',
        description: 'Performance over last 5 trading days',
        positive: true,
        icon: TrendingUp,
      },
      {
        label: 'Monthly Change',
        value: '—',
        description: 'Performance over last 21 trading days',
        positive: true,
        icon: TrendingUp,
      },
    ];
  }

  return [
    {
      label: 'Daily Change',
      value: formatPercent(summary.dailyChange),
      description: 'Change vs previous trading day',
      positive: summary.dailyChange >= 0,
      icon: summary.dailyChange >= 0 ? TrendingUp : TrendingDown,
    },
    {
      label: 'Weekly Change',
      value: formatPercent(summary.weeklyChange),
      description: 'Performance over last 5 trading days',
      positive: summary.weeklyChange >= 0,
      icon: summary.weeklyChange >= 0 ? TrendingUp : TrendingDown,
    },
    {
      label: 'Monthly Change',
      value: formatPercent(summary.monthlyChange),
      description: 'Performance over last 21 trading days',
      positive: summary.monthlyChange >= 0,
      icon: summary.monthlyChange >= 0 ? TrendingUp : TrendingDown,
    },
  ];
}

export default function DashboardPage() {
  const [performance, setPerformance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tickers, setTickers] = useState([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const userId = user?.id ?? null;
  const [isAddTickerOpen, setIsAddTickerOpen] = useState(false);
  const [tickerInput, setTickerInput] = useState('');
  const [isSavingTicker, setIsSavingTicker] = useState(false);
  const [addTickerError, setAddTickerError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !userId) {
      router.replace('/auth');
    }
  }, [isAuthLoading, userId, router]);

  const loadPortfolio = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    if (!userId) {
      setPerformance([]);
      setSummary(null);
      setTickers([]);
      setPortfolioError('Sign in to view your portfolio performance.');
      setIsLoadingPortfolio(false);
      return;
    }

    setIsLoadingPortfolio(true);
    setPortfolioError(null);

    try {
      const response = await fetch('/api/dashboard/portfolio', {
        method: 'GET',
        credentials: 'include',
      });

      if (!isMountedRef.current) {
        return;
      }

      if (response.status === 401) {
        setPerformance([]);
        setSummary(null);
        setTickers([]);
        setPortfolioError('Sign in to view your portfolio performance.');
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to load portfolio performance');
      }

      const payload = await response.json();

      if (!isMountedRef.current) {
        return;
      }

      const fetchedTickers = Array.isArray(payload.tickers) ? payload.tickers : [];
      const fetchedPerformance = Array.isArray(payload.performance) ? payload.performance : [];
      const fetchedSummary = payload.summary ?? null;

      setTickers(fetchedTickers);
      setPerformance(fetchedPerformance);
      setSummary(fetchedSummary);

      if (fetchedTickers.length === 0) {
        setPortfolioError('Add tickers to your portfolio to see performance.');
      } else if (fetchedPerformance.length === 0) {
        setPortfolioError('No performance data available yet. Please check back later.');
      } else {
        setPortfolioError(null);
      }
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      const message =
        error instanceof Error ? error.message : 'Failed to load portfolio performance';
      setPerformance([]);
      setSummary(null);
      setTickers([]);
      setPortfolioError(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoadingPortfolio(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    loadPortfolio();
  }, [isAuthLoading, loadPortfolio]);

  const openAddTickerModal = () => {
    setTickerInput('');
    setAddTickerError(null);
    setIsAddTickerOpen(true);
  };

  const closeAddTickerModal = () => {
    if (isSavingTicker) {
      return;
    }

    setIsAddTickerOpen(false);
    setTickerInput('');
    setAddTickerError(null);
  };

  const handleAddTickerSubmit = async (event) => {
    event.preventDefault();

    const normalisedTicker = tickerInput.trim().toUpperCase();

    if (normalisedTicker.length === 0) {
      setAddTickerError('Enter a ticker symbol to add.');
      return;
    }

    setIsSavingTicker(true);
    setAddTickerError(null);

    try {
      const response = await fetch('/api/dashboard/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ticker: normalisedTicker }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (error) {
        payload = null;
      }

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === 'string' && payload.error.length > 0
            ? payload.error
            : null) ?? 'Failed to add ticker';
        setAddTickerError(message);
        return;
      }

      if (payload && typeof payload.message === 'string' && payload.message.length > 0) {
        setAddTickerError(payload.message);
        return;
      }

      setIsAddTickerOpen(false);
      setTickerInput('');
      await loadPortfolio();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error occurred while adding ticker';
      setAddTickerError(message);
    } finally {
      setIsSavingTicker(false);
    }
  };

  const displayName = useMemo(() => {
    const fullName =
      typeof user?.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name.trim()
        : '';

    if (fullName.length > 0) {
      return fullName.split(' ')[0];
    }

    const email = typeof user?.email === 'string' ? user.email : '';
    if (email.length > 0) {
      return email.split('@')[0];
    }

    return 'Investor';
  }, [user]);

  const totalValue = useMemo(() => {
    if (!summary) {
      return 'Index 100.00';
    }

    return formatIndexValue(summary.latestValue);
  }, [summary]);

  const portfolioStats = useMemo(() => buildStats(summary), [summary]);

  return (
    <>
      {isAddTickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-[1px]"
          onClick={closeAddTickerModal}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-ticker-title"
          >
            <h3 id="add-ticker-title" className="text-lg font-semibold text-slate-900">
              Add a ticker
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter the stock symbol you want to include in your portfolio.
            </p>
            <form className="mt-4 space-y-4" onSubmit={handleAddTickerSubmit}>
              <div className="space-y-2">
                <label htmlFor="add-ticker-input" className="text-sm font-medium text-slate-700">
                  Ticker symbol
                </label>
                <input
                  id="add-ticker-input"
                  name="ticker"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold uppercase text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="e.g. AAPL"
                  value={tickerInput}
                  onChange={(event) => setTickerInput(event.target.value.toUpperCase())}
                  disabled={isSavingTicker}
                  autoFocus
                />
              </div>
              {addTickerError && (
                <p className="text-sm font-medium text-red-600">{addTickerError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeAddTickerModal}
                  disabled={isSavingTicker}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingTicker || tickerInput.trim().length === 0}>
                  {isSavingTicker ? 'Adding…' : 'Add ticker'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Here's your investor dashboard for today"
        className="text-left"
      />

      {/* Portfolio Section */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent>
            <h2 className="mb-3 text-xl font-bold">Investor Portfolio</h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-600">Tracked Tickers</h3>
              {tickers.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tickers.map((ticker) => (
                    <li
                      key={ticker}
                      className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm"
                    >
                      {ticker}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No tickers in your portfolio yet. Use the button below to add one.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="mt-4"
                onClick={openAddTickerModal}
                disabled={isAuthLoading || !userId}
              >
                Add ticker
              </Button>
            </div>
            <PortfolioPerformanceChart
              data={performance}
              loading={isLoadingPortfolio}
              error={portfolioError}
              className="mt-6"
            />
          </CardContent>
        </Card>

        <PortfolioOverview totalValue={totalValue} stats={portfolioStats} />
      </div>

      {/* News & Performers */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <NewsSection newsItems={NEWS_ITEMS} className="rounded-2xl lg:col-span-2" />

        <PerformersSection performers={PERFORMERS} className="rounded-2xl" />
      </div>

      {/* Indexes */}
      <IndexesSection indexes={INDEXES} className="mb-6 rounded-2xl" />

      {/* Technical Models */}
      <TechnicalModelsSection className="mb-6" />
    </main>
    </>
  );
}


