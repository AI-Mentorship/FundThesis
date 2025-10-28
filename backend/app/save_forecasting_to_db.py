import sys
import os
import yfinance as yf
from sklearn.preprocessing import RobustScaler  # ADD THIS LINE
from sklearn.metrics import mean_squared_error, r2_score

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from forecasting.xg_boost_tester import xgb_predict,train_test_split

def get_next_30_day_predictions(ticker,num_past_days_to_use_for_prediction="1y"):

    stock = yf.Ticker(ticker)

    df = stock.history(period=num_past_days_to_use_for_prediction)


    df['SMA_10'] = df['Close'].rolling(10).mean()
    df['SMA_30'] = df['Close'].rolling(30).mean()
    df['Volatility'] = df['Close'].rolling(10).std()
    df['Volume_MA'] = df['Volume'].rolling(10).mean()

    df['target'] = df['Close'].shift(-1)

    df.dropna(inplace=True)  # cuz shifting everything creates some null values
    training_df = df.copy()

    train_constant = 0.5  # subject to explosive change

    feature_cols = [col for col in training_df.columns if col != 'target']



    train, test = train_test_split(training_df, train_constant)

    # Scale features cuz everything was innaccurate
    scaler = RobustScaler()
    train[feature_cols] = scaler.fit_transform(train[feature_cols])   # fit only on train
    test[feature_cols] = scaler.transform(test[feature_cols])         # apply on test

    y_pred, y_test, model = xgb_predict(train, test)

    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    #ADD TO SUPABASE
    

get_next_30_day_predictions('AAPL')
