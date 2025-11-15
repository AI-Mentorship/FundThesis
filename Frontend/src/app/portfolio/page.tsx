"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortfolioTable } from "@/components/ui/PortfolioTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

type HoldingRow = {
  symbol: string;
  shares: number;
  price: string;
  value: string;
  gainLoss: string;
  isPositive: boolean;
};

type StockQuoteResponse = {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
};

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatGainLoss(change: number, changePercent: number): {
  text: string;
  isPositive: boolean;
} {
  const isPositive = change >= 0;
  const sign = isPositive ? "+" : "";
  const text = `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(
    2
  )}%)`;

  return { text, isPositive };
}

export default function PortfolioPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const userId = user?.id ?? null;
  const isMountedRef = useRef(true);

  const [tickers, setTickers] = useState<string[]>([]);
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);
  const [isAddTickerOpen, setIsAddTickerOpen] = useState(false);
  const [tickerInput, setTickerInput] = useState("");
  const [isSavingTicker, setIsSavingTicker] = useState(false);
  const [addTickerError, setAddTickerError] = useState<string | null>(null);
  const [deletingTicker, setDeletingTicker] = useState<string | null>(null);
  const [tickerActionError, setTickerActionError] = useState<string | null>(
    null
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !userId) {
      router.replace("/auth");
    }
  }, [isAuthLoading, userId, router]);

  const loadHoldingsData = useCallback(async (symbols: string[]) => {
    if (!isMountedRef.current) {
      return;
    }
  
    if (symbols.length === 0) {
      setHoldings([]);
      setHoldingsError(null);
      return;
    }
  
    setIsLoadingHoldings(true);
    setHoldingsError(null);
  
    try {
      // Use the dashboard API which already has all the data!
      const response = await fetch("/api/dashboard/portfolio", {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to load portfolio data");
      }
  
      const payload = await response.json();
      
      if (!isMountedRef.current) {
        return;
      }
  
      // Get the latest price from performance data
      const performance = payload.performance || [];
      const summary = payload.summary || null;
      
      if (performance.length === 0 || !summary) {
        setHoldingsError("No price data available yet.");
        setHoldings([]);
        return;
      }
  
      // Calculate holdings from the summary data
      const holdings: HoldingRow[] = symbols.map((symbol) => {
        // Use the summary to get basic price info
        const price = summary.latestValue || 100; // From index value
        const change = summary.dailyChange || 0;
        const changePercent = summary.dailyChange || 0;
        
        const { text, isPositive } = formatGainLoss(change, changePercent);
  
        return {
          symbol,
          shares: 1,
          price: formatCurrency(price),
          value: formatCurrency(price),
          gainLoss: text,
          isPositive,
        };
      });
  
      setHoldings(holdings);
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Unexpected holdings load error:", error);
        setHoldings([]);
        setHoldingsError("Failed to load holdings data.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingHoldings(false);
      }
    }
  }, []);


  const loadPortfolio = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    if (!userId) {
      setTickers([]);
      setHoldings([]);
      setPortfolioError("Sign in to view your portfolio.");
      setIsLoadingPortfolio(false);
      return;
    }

    setIsLoadingPortfolio(true);
    setPortfolioError(null);

    try {
      const response = await fetch("/api/dashboard/portfolio", {
        method: "GET",
        credentials: "include",
      });

      if (!isMountedRef.current) {
        return;
      }

      if (response.status === 401) {
        setTickers([]);
        setHoldings([]);
        setPortfolioError("Sign in to view your portfolio.");
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to load portfolio");
      }

      const payload = await response.json();

      if (!isMountedRef.current) {
        return;
      }

      const fetchedTickers: string[] = Array.isArray(payload.tickers)
        ? payload.tickers
        : [];

      setTickers(fetchedTickers);

      if (fetchedTickers.length === 0) {
        setHoldings([]);
        setHoldingsError(null);
        setPortfolioError(
          "Add tickers to your portfolio to track their performance."
        );
        return;
      }

      await loadHoldingsData(fetchedTickers);
      setPortfolioError(null);
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Failed to load portfolio";
      setTickers([]);
      setHoldings([]);
      setPortfolioError(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoadingPortfolio(false);
      }
    }
  }, [loadHoldingsData, userId]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    loadPortfolio();
  }, [isAuthLoading, loadPortfolio]);

  const portfolioSummary = useMemo(() => {
    if (tickers.length === 0) {
      return "No tickers in your portfolio yet.";
    }

    return `Tracking ${tickers.length} ${
      tickers.length === 1 ? "ticker" : "tickers"
    }: ${tickers.join(", ")}`;
  }, [tickers]);

  const openAddTickerModal = () => {
    setTickerInput("");
    setAddTickerError(null);
    setTickerActionError(null);
    setIsAddTickerOpen(true);
  };

  const closeAddTickerModal = () => {
    if (isSavingTicker) {
      return;
    }

    setIsAddTickerOpen(false);
    setTickerInput("");
    setAddTickerError(null);
  };

  const handleAddTickerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalisedTicker = tickerInput.trim().toUpperCase();

    if (normalisedTicker.length === 0) {
      setAddTickerError("Enter a ticker symbol to add.");
      return;
    }

    setIsSavingTicker(true);
    setAddTickerError(null);
    setTickerActionError(null);

    try {
      const response = await fetch("/api/dashboard/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ticker: normalisedTicker }),
      });

      let payload: { error?: string; message?: string } | null = null;
      try {
        payload = await response.json();
      } catch (error) {
        payload = null;
      }

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === "string" && payload.error) ||
          "Failed to add ticker";
        setAddTickerError(message);
        return;
      }

      if (payload && typeof payload.message === "string" && payload.message) {
        setAddTickerError(payload.message);
        return;
      }

      setIsAddTickerOpen(false);
      setTickerInput("");
      setTickerActionError(null);
      await loadPortfolio();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error occurred while adding ticker";
      setAddTickerError(message);
    } finally {
      setIsSavingTicker(false);
    }
  };

  const handleDeleteTicker = useCallback(
    async (symbol: string) => {
      const normalisedTicker = symbol.trim().toUpperCase();

      if (normalisedTicker.length === 0 || !isMountedRef.current) {
        return;
      }

      setTickerActionError(null);
      setDeletingTicker(normalisedTicker);

      try {
        const response = await fetch("/api/dashboard/portfolio", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ticker: normalisedTicker }),
        });

        let payload: { error?: string; message?: string } | null = null;
        try {
          payload = await response.json();
        } catch (error) {
          payload = null;
        }

        if (!response.ok) {
          const message =
            (payload && typeof payload.error === "string" && payload.error) ||
            "Failed to delete ticker";
          if (isMountedRef.current) {
            setTickerActionError(message);
          }
          return;
        }

        if (payload && typeof payload.message === "string" && payload.message) {
          if (isMountedRef.current) {
            setTickerActionError(payload.message);
          }
          return;
        }

        await loadPortfolio();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unexpected error occurred while deleting ticker";
        if (isMountedRef.current) {
          setTickerActionError(message);
        }
      } finally {
        if (isMountedRef.current) {
          setDeletingTicker(null);
        }
      }
    },
    [loadPortfolio]
  );

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
            aria-labelledby="portfolio-add-ticker-title"
          >
            <h3
              id="portfolio-add-ticker-title"
              className="text-lg font-semibold text-slate-900"
            >
              Add a ticker
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter the stock symbol you want to include in your portfolio.
            </p>
            <form className="mt-4 space-y-4" onSubmit={handleAddTickerSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="portfolio-add-ticker-input"
                  className="text-sm font-medium text-slate-700"
                >
                  Ticker symbol
                </label>
                <input
                  id="portfolio-add-ticker-input"
                  name="ticker"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold uppercase text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="e.g. AAPL"
                  value={tickerInput}
                  onChange={(event) =>
                    setTickerInput(event.target.value.toUpperCase())
                  }
                  disabled={isSavingTicker}
                  autoFocus
                />
              </div>
              {addTickerError && (
                <p className="text-sm font-medium text-red-600">
                  {addTickerError}
                </p>
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
                <Button
                  type="submit"
                  disabled={isSavingTicker || tickerInput.trim().length === 0}
                >
                  {isSavingTicker ? "Adding…" : "Add ticker"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 py-8">
          <PageHeader
            title="Portfolio"
            description="Manage and optimize your investment portfolio"
          />

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {portfolioSummary}
                </p>
                {portfolioError && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {portfolioError}
                  </p>
                )}
                {tickerActionError && !portfolioError && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {tickerActionError}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={openAddTickerModal}
                disabled={isAuthLoading || !userId}
              >
                Add ticker
              </Button>
            </div>

            {tickers.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {tickers.map((ticker) => {
                  const isDeleting = deletingTicker === ticker;
                  return (
                    <li
                      key={ticker}
                      className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
                    >
                      <span>{ticker}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTicker(ticker)}
                        disabled={isDeleting}
                        className="rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
                        aria-label={`Remove ${ticker} from portfolio`}
                      >
                        {isDeleting ? "Removing…" : "Remove"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mt-6">
            {isLoadingPortfolio || isLoadingHoldings ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <span className="text-sm text-slate-500">
                  Loading portfolio data…
                </span>
              </div>
            ) : tickers.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <span className="text-sm text-slate-500">
                  Add tickers to see them listed here.
                </span>
              </div>
            ) : (
              <PortfolioTable holdings={holdings} />
            )}

            {holdingsError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {holdingsError}
              </p>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
