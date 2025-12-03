-- Run this SQL in your Supabase SQL editor once to create the table used by the app.
-- It creates the stock_forecasts table with the schema requested by the user.

CREATE TABLE IF NOT EXISTS public.stock_forecasts (
    id uuid PRIMARY KEY,
    symbol text NOT NULL,
    price_series jsonb,
    forecast_results jsonb,
    run_date timestamptz,
    updated_at timestamptz DEFAULT now()
);

-- Optionally create an index on symbol and run_date for faster lookups
CREATE INDEX IF NOT EXISTS idx_stock_forecasts_symbol_run_date ON public.stock_forecasts (symbol, run_date DESC);
