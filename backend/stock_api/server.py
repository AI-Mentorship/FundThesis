from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import os

app = Flask(__name__)

# Configure CORS based on environment
if os.getenv('FLASK_ENV') == 'production':
    CORS(app, resources={r"/api/*": {"origins": os.getenv('FRONTEND_URL', '*')}})
else:
    CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    # Get pagination parameters from query string
    limit = request.args.get('limit', default=20, type=int)
    offset = request.args.get('offset', default=0, type=int)
    
    # Extended list of symbols (you can add more to reach 200)
    symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 
               'JPM', 'BAC', 'GS', 'WFC', 'C', 'JNJ', 'UNH', 'PFE', 'ABBV', 'TMO',
               'WMT', 'HD', 'DIS', 'NKE', 'SBUX', 'XOM', 'CVX', 'COP', 'BA', 'CAT', 
               'GE', 'T', 'VZ', 'CMCSA', 'INTC', 'AMD', 'QCOM', 'AVGO', 'TXN', 'MU',
               'V', 'MA', 'PYPL', 'AXP', 'SQ', 'BLK', 'SCHW', 'MS', 'SPGI', 'ICE',
               'KO', 'PEP', 'COST', 'MCD', 'MDLZ', 'PM', 'MO', 'CL', 'PG', 'UL',
               'ADBE', 'CRM', 'ORCL', 'NOW', 'INTU', 'SHOP', 'SNOW', 'DDOG', 'ZM', 'TEAM',
               'UPS', 'FDX', 'DAL', 'LUV', 'UAL', 'AAL', 'MAR', 'HLT', 'RCL', 'CCL',
               'HON', 'RTX', 'LMT', 'NOC', 'GD', 'BA', 'DE', 'EMR', 'ITW', 'MMM',
               'BMY', 'LLY', 'MRK', 'GILD', 'AMGN', 'BIIB', 'REGN', 'VRTX', 'ILMN', 'ALXN',
               'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'PEG', 'XEL', 'ED',
               'LOW', 'TGT', 'TJX', 'ROST', 'DG', 'DLTR', 'BBY', 'EBAY', 'ETSY', 'W',
               'F', 'GM', 'TM', 'HMC', 'RACE', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI',
               'BABA', 'JD', 'PDD', 'BIDU', 'TCEHY', 'SE', 'MELI', 'GRAB', 'DIDI', 'CPNG',
               'UBER', 'LYFT', 'ABNB', 'DASH', 'SPOT', 'RBLX', 'U', 'PINS', 'SNAP', 'TWTR',
               'DHR', 'ABT', 'SYK', 'BSX', 'MDT', 'ISRG', 'EW', 'ZBH', 'BAX', 'BDX',
               'WBA', 'CVS', 'CI', 'HUM', 'ANTM', 'CNC', 'MOH', 'ELV', 'HCA', 'UHS',
               'NXPI', 'MRVL', 'LRCX', 'KLAC', 'AMAT', 'ADI', 'MCHP', 'SWKS', 'QRVO', 'SLAB',
               'CMG', 'YUM', 'QSR', 'DPZ', 'WING', 'DNUT', 'JACK', 'WEN', 'SONO', 'CAKE',
               'SLB', 'HAL', 'BKR', 'NOV', 'FTI', 'HP', 'RIG', 'VAL', 'MRO', 'DVN']
    
    # Paginate symbols
    paginated_symbols = symbols[offset:offset + limit]
    
    stock_data = []
    
    for symbol in paginated_symbols:
        try:
            ticker = yf.Ticker(symbol)
            history = ticker.history(period='1d')
            
            if not history.empty:
                current_price = history['Close'].iloc[-1]
                open_price = history['Open'].iloc[0]
                change = current_price - open_price
                change_percent = (change / open_price) * 100
                
                stock_data.append({
                    'symbol': symbol,
                    'price': round(current_price, 2),
                    'change': round(change, 2),
                    'changePercent': round(change_percent, 2)
                })
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
    
    return jsonify({
        'stocks': stock_data,
        'total': len(symbols),
        'offset': offset,
        'limit': limit,
        'hasMore': (offset + limit) < len(symbols)
    })

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_detail(symbol):
    try:
        # Get timeframe from query params (default to 1 month)
        days = request.args.get('days', default=30, type=int)
        
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Get historical data based on timeframe
        if days <= 7:
            period = '5d'
            interval = '1h'
        elif days <= 30:
            period = '1mo'
            interval = '1d'
        elif days <= 90:
            period = '3mo'
            interval = '1d'
        elif days <= 365:
            period = '1y'
            interval = '1d'
        else:
            period = 'max'
            interval = '1wk'
        
        history = ticker.history(period=period, interval=interval)
        
        # Get current day data
        today_history = ticker.history(period='1d')
        
        if not today_history.empty:
            current_price = today_history['Close'].iloc[-1]
            open_price = today_history['Open'].iloc[0]
            change = current_price - open_price
            change_percent = (change / open_price) * 100
            
            # Format historical data for chart
            chart_data = []
            for index, row in history.iterrows():
                chart_data.append({
                    'date': index.strftime('%Y-%m-%d'),
                    'price': round(float(row['Close']), 2),
                    'volume': int(row['Volume'])
                })
            
            return jsonify({
                'symbol': symbol,
                'company': info.get('longName', symbol),
                'price': round(current_price, 2),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
                'open': round(float(today_history['Open'].iloc[0]), 2) if not today_history.empty else 0,
                'high': round(float(today_history['High'].max()), 2) if not today_history.empty else 0,
                'low': round(float(today_history['Low'].min()), 2) if not today_history.empty else 0,
                'volume': int(today_history['Volume'].iloc[-1]) if not today_history.empty else 0,
                'avgVolume': int(info.get('averageVolume', 0)),
                'fiftyTwoWeekHigh': round(float(info.get('fiftyTwoWeekHigh', 0)), 2),
                'fiftyTwoWeekLow': round(float(info.get('fiftyTwoWeekLow', 0)), 2),
                'marketCap': info.get('marketCap', 0),
                'peRatio': round(float(info.get('trailingPE', 0)), 2) if info.get('trailingPE') else 0,
                'dividendYield': info.get('dividendYield', 0),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'chartData': chart_data
            })
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'API is running'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')