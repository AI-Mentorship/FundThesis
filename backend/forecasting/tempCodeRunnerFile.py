df['SMA_10'] = df['Close'].rolling(10).mean()
# df['SMA_30'] = df['Close'].rolling(30).mean()
# df['Volatility'] = df['Close'].rolling(10).std()
# df['Volume_MA'] = df['Volume'].rolling(10).mean()