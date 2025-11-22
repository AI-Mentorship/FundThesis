import argparse
import contextlib
import io
import json
import sys
from pathlib import Path

# Ensure module path includes this directory
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.append(str(CURRENT_DIR))

from save_forecasting_to_db import get_next_30_day_predictions  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="Generate forecast data for a stock symbol.")
    parser.add_argument("symbol", help="Ticker symbol to forecast, e.g. AAPL")
    parser.add_argument("--forecast-days", type=int, default=30, help="Number of days to forecast")
    parser.add_argument("--history-window", default="1y", help="History window passed to helper")
    args = parser.parse_args()

    capture_buffer = io.StringIO()
    with contextlib.redirect_stdout(capture_buffer):
        forecast_df, mse, r2 = get_next_30_day_predictions(
            args.symbol,
            num_past_days_to_use=args.history_window,
            forecast_days=args.forecast_days,
        )

    if forecast_df is None:
        output = {"forecast": None, "mse": None, "r2": None, "logs": capture_buffer.getvalue()}
    else:
        df = forecast_df.copy()
        df["Date"] = df["Date"].astype(str)
        records = [
            {"date": row["Date"], "price": float(row["Predicted_Close"])}
            for row in df.to_dict(orient="records")
        ]
        output = {
            "forecast": records,
            "mse": mse,
            "r2": r2,
            "logs": capture_buffer.getvalue(),
        }

    json.dump(output, sys.stdout)


if __name__ == "__main__":
    main()

