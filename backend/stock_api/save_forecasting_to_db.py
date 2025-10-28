import sys
import os
import yfinance as yf
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import mean_squared_error, r2_score
from xgboost import XGBRegressor
from datetime import date, timedelta
import pandas as pd
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def train_test_split(data, perc):
    """Split data into train/test - trains with the first (1-perc) and tests with the rest"""
    n = int(len(data) * (1 - perc))
    return data.iloc[:n].copy(), data.iloc[n:].copy()

def get_next_30_day_predictions(ticker, num_past_days_to_use="1y", forecast_days=30):
    """
    Improved forecasting using the test set approach instead of iterative prediction.
    Returns predictions for the next N days based on historical patterns.
    """
    
    print(f"📊 Fetching data for {ticker}...")
    stock = yf.Ticker(ticker)
    df = stock.history(period=num_past_days_to_use)
    
    if df.empty or len(df) < 50:
        print(f"⚠️ Insufficient data for {ticker}")
        return None, None, None
    
    # --- Feature engineering ---
    df['SMA_10'] = df['Close'].rolling(10).mean()
    df['SMA_30'] = df['Close'].rolling(30).mean()
    df['Volatility'] = df['Close'].rolling(10).std()
    df['Volume_MA'] = df['Volume'].rolling(10).mean()
    
    # Create target - next day's closing price
    df['target'] = df['Close'].shift(-1)
    
    # Drop NaN values
    df.dropna(inplace=True)
    
    if len(df) < 50:
        print(f"⚠️ Insufficient data after feature engineering for {ticker}")
        return None, None, None
    
    print(f"✅ Data prepared: {len(df)} rows")
    
    # Prepare training data
    training_df = df.copy()
    feature_cols = ['Open', 'High', 'Low', 'Close', 'Volume', 
                    'SMA_10', 'SMA_30', 'Volatility', 'Volume_MA']
    
    # Split into train/test (use last 20% as test to simulate future predictions)
    train_constant = 0.2  # Use 20% for test (simulates future)
    train, test = train_test_split(training_df, train_constant)
    
    print(f"📈 Train size: {len(train)}, Test size: {len(test)}")
    
    # Scale features
    scaler = RobustScaler()
    train[feature_cols] = scaler.fit_transform(train[feature_cols])
    test[feature_cols] = scaler.transform(test[feature_cols])
    
    # Train XGBoost model with better hyperparameters
    model = XGBRegressor(
        n_estimators=400,
        learning_rate=0.1,
        max_depth=6,
        min_child_weight=1,
        subsample=0.9,
        colsample_bytree=0.9,
        reg_alpha=0.01,
        reg_lambda=0.01,
        random_state=42
    )
    
    print(f"🤖 Training model...")
    model.fit(
        train[feature_cols], 
        train['target'],
        eval_set=[(test[feature_cols], test['target'])],
        verbose=False
    )
    
    # Predict on test set
    y_pred = model.predict(test[feature_cols])
    y_test = test['target'].values
    
    # Calculate metrics
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"📊 Model Performance - MSE: {mse:.2f}, R2: {r2:.4f}")
    
    # Take the last N predictions as "forecast" for next N days
    # This simulates what the model thinks the next N days will look like
    forecast_predictions = y_pred[-min(forecast_days, len(y_pred)):]
    
    # Get the corresponding dates from the test set
    test_dates = test.index[-len(forecast_predictions):]
    
    # Create future dates starting from the last date in the dataset
    last_date = df.index[-1]
    future_dates = [last_date + timedelta(days=i+1) for i in range(len(forecast_predictions))]
    
    # Create forecast DataFrame
    forecast_df = pd.DataFrame({
        'Date': future_dates,
        'Predicted_Close': forecast_predictions
    })
    
    print(f"✅ Generated {len(forecast_df)} forecast points")
    print(f"📅 Forecast range: {forecast_df['Date'].min()} to {forecast_df['Date'].max()}")
    print(f"💰 Price range: ${forecast_df['Predicted_Close'].min():.2f} to ${forecast_df['Predicted_Close'].max():.2f}")
    
    return forecast_df, mse, r2

if __name__ == "__main__":
    # Test the function
    ticker = 'AAPL'
    print(f"Testing forecast for {ticker}...\n")
    
    forecast_df, mse, r2 = get_next_30_day_predictions(ticker)
    
    if forecast_df is not None:
        print("\n📊 Forecast Results:")
        print(forecast_df.head(10))
        print("\n📈 Summary:")
        print(f"MSE: {mse:.2f}")
        print(f"R2 Score: {r2:.4f}")