from supabase import create_client
import os
import uuid
import json
from datetime import datetime, timedelta

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print('⚠️ SUPABASE_URL or SUPABASE_KEY not set in environment. Supabase caching will be disabled or fail at runtime.')

_supabase = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"⚠️ Error creating Supabase client: {e}")
    _supabase = None


def get_cached_forecast(symbol):
    """Return the most recent cached forecast row for `symbol` if within last 24 hours, else None."""
    if _supabase is None:
        return None

    try:
        resp = _supabase.table('stock_forecasts').select('*').eq('symbol', symbol).order('run_date', desc=True).limit(1).execute()
        data = None
        if isinstance(resp, dict):
            data = resp.get('data')
        else:
            # supabase-py typically returns an object with .data
            data = getattr(resp, 'data', None)

        if not data:
            return None

        row = data[0]
        run_date = row.get('run_date')
        if run_date is None:
            return None

        # parse iso timestamp and check age
        try:
            # handle timestamps returned as string
            if isinstance(run_date, str):
                # fromisoformat can't handle trailing Z reliably in all Python versions
                try:
                    parsed = datetime.fromisoformat(run_date.replace('Z', '+00:00'))
                except Exception:
                    # fallback to pandas
                    import pandas as pd
                    parsed = pd.to_datetime(run_date).to_pydatetime()
            else:
                parsed = run_date
        except Exception:
            parsed = None

        if parsed is None:
            return None

        if datetime.utcnow().replace(tzinfo=None) - parsed.replace(tzinfo=None) <= timedelta(hours=24):
            return row
        return None

    except Exception as e:
        print(f"⚠️ Supabase fetch error for {symbol}: {e}")
        return None


def insert_cached_forecast(symbol, price_series, forecast_results):
    """Insert a new cached forecast row. Returns response or None on failure."""
    if _supabase is None:
        return None

    payload = {
        'id': str(uuid.uuid4()),
        'symbol': symbol,
        'price_series': price_series,
        'forecast_results': forecast_results,
        'run_date': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }

    try:
        resp = _supabase.table('stock_forecasts').insert(payload).execute()
        return resp
    except Exception as e:
        print(f"⚠️ Supabase insert error for {symbol}: {e}")
        return None
