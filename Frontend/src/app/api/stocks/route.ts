import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// Create a singleton instance
const yahooFinance = new YahooFinance();

// Extended list of symbols (matching the Python server)
const SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 
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
  'SLB', 'HAL', 'BKR', 'NOV', 'FTI', 'HP', 'RIG', 'VAL', 'MRO', 'DVN'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Paginate symbols
    const paginatedSymbols = SYMBOLS.slice(offset, offset + limit);
    
    const stockData = [];
    
    // Fetch stock data in parallel
    const promises = paginatedSymbols.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol);
        
        if (quote && quote.regularMarketPrice !== undefined) {
          const currentPrice = quote.regularMarketPrice;
          const openPrice = quote.regularMarketOpen || currentPrice;
          const change = currentPrice - openPrice;
          const changePercent = openPrice !== 0 ? (change / openPrice) * 100 : 0;
          
          return {
            symbol: symbol,
            price: Math.round(currentPrice * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    const validStocks = results.filter((stock): stock is NonNullable<typeof stock> => stock !== null);
    
    return NextResponse.json({
      stocks: validStocks,
      total: SYMBOLS.length,
      offset: offset,
      limit: limit,
      hasMore: (offset + limit) < SYMBOLS.length
    });
  } catch (error) {
    console.error('Error in /api/stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    );
  }
}

