import yfinance as yf
from statsmodels.tsa.arima.model import ARIMA
from prophet import Prophet
import matplotlib.pyplot as plt
import pandas as pd

def get_stock_data(ticker):
    ticker_obj = yf.Ticker(ticker)
    hist = ticker_obj.history(period="1y")  # last 1 year
    hist = hist.reset_index()  # move Date from index to column
    return hist

def get_forecasting_prediction(ticker_df, forecast_days=7):
    results = {}

    # Using ARIMA
    series = ticker_df.set_index("Date")['Close']
    model = ARIMA(series, order=(5,1,0))
    model_fit = model.fit()
    arima_forecast = model_fit.forecast(steps=forecast_days)
    results['ARIMA'] = arima_forecast

    # Using Prophet
    prophet_df = ticker_df.rename(columns={'Date':'ds','Close':'y'})
    prophet_df['ds'] = pd.to_datetime(prophet_df['ds']).dt.tz_localize(None)#stripping timezones cuz prophet doesn't like it
    prophet_df = prophet_df.dropna(subset=['y'])#dropping any missing values

    model = Prophet(daily_seasonality=True)
    model.fit(prophet_df)
    future = model.make_future_dataframe(periods=forecast_days)
    forecast = model.predict(future)
    results['Prophet'] = forecast[['ds','yhat']].tail(forecast_days)

    return results

def plot_forecast(df, arima_forecast=None, prophet_forecast=None,sarima_forecast=None):
    plt.figure(figsize=(12,6))
    plt.plot(df['Date'], df['Close'], label='Historical', color='blue')

    # Plot ARIMA if provided
    if arima_forecast is not None:
        last_date = df['Date'].iloc[-1]
        arima_index = pd.date_range(start=last_date + pd.Timedelta(days=1),
                                    periods=len(arima_forecast),
                                    freq='B')#need to reset cuz of sum bugs to start of the end date of stock_data
        arima_forecast.index = arima_index
        plt.plot(arima_forecast.index, arima_forecast, label='ARIMA Forecast', color='red', linestyle='--')

    # Plot Prophet if provided
    if prophet_forecast is not None:
        plt.plot(prophet_forecast['ds'], prophet_forecast['yhat'], label='Prophet Forecast', color='green', linestyle='--')

    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.title('Stock Price Forecast')
    plt.legend()
    plt.grid(True)
    plt.show()

# Usage
stock_data = get_stock_data('AAPL')
stock_data.to_csv("data/example_data.csv")

# forecasting_results = get_forecasting_prediction(stock_data, 30)

# plot_forecast(stock_data, 
#               arima_forecast=forecasting_results['ARIMA'], 
#               prophet_forecast=forecasting_results['Prophet'])
