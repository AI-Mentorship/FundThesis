import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// Create a singleton instance
const yahooFinance = new YahooFinance();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: symbolParam } = await params;
    const symbol = symbolParam.toUpperCase();
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    console.log(`📊 Fetching stock detail for ${symbol}...`);
    
    // Fetch quote first
    const quoteResult = await yahooFinance.quote(symbol);
    
    if (!quoteResult) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      );
    }
    
    const quote = quoteResult as {
      regularMarketPrice?: number;
      regularMarketOpen?: number;
      regularMarketDayHigh?: number;
      regularMarketDayLow?: number;
      regularMarketVolume?: number;
      averageVolume?: number;
      fiftyTwoWeekHigh?: number;
      fiftyTwoWeekLow?: number;
      marketCap?: number;
      trailingPE?: number;
      dividendYield?: number;
      sector?: string;
      industry?: string;
      longName?: string;
      shortName?: string;
    };
    
    // Fetch historical data with error handling
    let historical: Array<{ date?: Date | string; close?: number; volume?: number }> = [];
    try {
      // yahoo-finance2 supports: '1d', '1wk', '1mo' intervals
      const interval = days <= 30 ? '1d' : days <= 365 ? '1d' : '1wk';
      const historicalResult = await yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: interval as '1d' | '1wk' | '1mo'
      });
      historical = Array.isArray(historicalResult) ? historicalResult : [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      historical = [];
    }
    
    if (historical.length === 0) {
      return NextResponse.json(
        { error: 'No historical data available for this symbol' },
        { status: 404 }
      );
    }
    
    const currentPrice = quote.regularMarketPrice || 0;
    const openPrice = quote.regularMarketOpen || currentPrice;
    const change = currentPrice - openPrice;
    const changePercent = openPrice !== 0 ? (change / openPrice) * 100 : 0;
    
    // Format historical data for chart
    const chartData = historical.map((item: { date?: Date | string; close?: number; volume?: number }) => ({
      date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : String(item.date || ''),
      price: Math.round((item.close || 0) * 100) / 100,
      volume: item.volume || 0
    }));
    
    console.log(`✅ Historical data: ${chartData.length} points`);
    
    // Note: Forecasting would need to call Python backend or be implemented separately
    // For now, we'll return empty forecast data
    const forecastData: Array<{ date: string; price: number }> = [];
    
    const responseData = {
      symbol: symbol,
      company: quote.longName || quote.shortName || symbol,
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      open: Math.round((quote.regularMarketOpen || 0) * 100) / 100,
      high: Math.round((quote.regularMarketDayHigh || quote.fiftyTwoWeekHigh || 0) * 100) / 100,
      low: Math.round((quote.regularMarketDayLow || quote.fiftyTwoWeekLow || 0) * 100) / 100,
      volume: quote.regularMarketVolume || 0,
      avgVolume: quote.averageVolume || 0,
      fiftyTwoWeekHigh: Math.round((quote.fiftyTwoWeekHigh || 0) * 100) / 100,
      fiftyTwoWeekLow: Math.round((quote.fiftyTwoWeekLow || 0) * 100) / 100,
      marketCap: quote.marketCap || 0,
      peRatio: quote.trailingPE ? Math.round(quote.trailingPE * 100) / 100 : 0,
      dividendYield: quote.dividendYield || 0,
      sector: quote.sector || 'N/A',
      industry: quote.industry || 'N/A',
      chartData: chartData,
      forecastData: forecastData
    };
    
    console.log(`🎉 Response ready for ${symbol}`);
    return NextResponse.json(responseData);
    
  } catch (error) {
    const { symbol: symbolParam } = await params;
    console.error(`❌ Error fetching ${symbolParam}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

