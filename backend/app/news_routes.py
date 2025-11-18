# app/news_routes.py
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import re
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

router = APIRouter()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.environ.get("SUPABASE_SERVICE_ROLE")

# Initialize Supabase client if credentials are available
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

# Common stock tickers for major exchanges (NYSE, NASDAQ)
# This is a simplified list - in production, you'd want a comprehensive ticker database
MAJOR_TICKERS = {
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JNJ',
    'WMT', 'JPM', 'MA', 'PG', 'UNH', 'HD', 'DIS', 'BAC', 'VZ', 'ADBE', 'NFLX',
    'PYPL', 'CMCSA', 'KO', 'PFE', 'NKE', 'INTC', 'T', 'CSCO', 'XOM', 'AVGO',
    'COST', 'PEP', 'TMO', 'ABBV', 'MRK', 'CVX', 'WFC', 'ACN', 'DHR', 'MCD',
    'NEE', 'LIN', 'BMY', 'QCOM', 'HON', 'AMGN', 'LOW', 'UPS', 'RTX', 'AMT'
}

# Extended list of common ticker patterns (1-5 letters)
TICKER_PATTERN = re.compile(r'\b([A-Z]{1,5})\b')


def extract_tickers_from_text(text: str) -> List[str]:
    """Extract potential stock tickers from text."""
    if not text:
        return []
    
    # Find all uppercase letter sequences (potential tickers)
    potential_tickers = TICKER_PATTERN.findall(text.upper())
    
    # Filter to only known major tickers
    found_tickers = [ticker for ticker in potential_tickers if ticker in MAJOR_TICKERS]
    
    # Also check if any tickers are mentioned explicitly in the text
    text_upper = text.upper()
    for ticker in MAJOR_TICKERS:
        if ticker in text_upper and ticker not in found_tickers:
            found_tickers.append(ticker)
    
    return list(set(found_tickers))  # Remove duplicates


def generate_recommendation(article: dict) -> str:
    """
    Generate Buy/Hold/Sell recommendation based on sentiment and article content.
    
    Logic:
    - Positive sentiment + strong keywords -> Buy
    - Neutral sentiment -> Hold
    - Negative sentiment + strong keywords -> Sell
    """
    sentiment = article.get('label', '').lower() if article.get('label') else 'neutral'
    
    # Keywords that suggest strong positive/negative signals
    positive_keywords = ['surge', 'rally', 'gain', 'beat', 'exceed', 'growth', 'profit', 
                        'earnings', 'upgrade', 'bullish', 'outperform', 'buy', 'strong']
    negative_keywords = ['plunge', 'drop', 'fall', 'miss', 'decline', 'loss', 'downgrade',
                        'bearish', 'underperform', 'sell', 'weak', 'concern', 'warning']
    
    headline = (article.get('headline') or '').lower()
    summary = (article.get('summary') or '').lower()
    text = headline + ' ' + summary
    
    positive_count = sum(1 for word in positive_keywords if word in text)
    negative_count = sum(1 for word in negative_keywords if word in text)
    
    # Determine recommendation
    if sentiment == 'positive' and positive_count >= 2:
        return 'Buy'
    elif sentiment == 'negative' and negative_count >= 2:
        return 'Sell'
    elif sentiment == 'positive' and positive_count >= 1:
        return 'Buy'
    elif sentiment == 'negative' and negative_count >= 1:
        return 'Sell'
    elif sentiment == 'positive':
        return 'Hold'
    elif sentiment == 'negative':
        return 'Hold'
    else:
        return 'Hold'


@router.get("/news/recent")
async def get_recent_news():
    """
    Get recent financial news articles from the past 24 hours.
    Returns articles that mention retail-tradeable stocks.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE environment variables.")
    
    try:
        # Calculate timestamp for 24 hours ago
        twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        timestamp_str = twenty_four_hours_ago.isoformat()
        
        # Query Supabase for articles from the last 24 hours
        # Order by published_at descending to get newest first
        # If no articles in last 24h, try last 48 hours to be more lenient
        response = supabase.table("articles").select(
            "id, headline, summary, published_at, url, source, label, related, full_text, tickers"
        ).gte("published_at", timestamp_str).order("published_at", desc=True).limit(100).execute()
        
        # If no articles in last 24h, try last 48 hours
        if not response.data or len(response.data) == 0:
            forty_eight_hours_ago = datetime.now(timezone.utc) - timedelta(hours=48)
            timestamp_str_48h = forty_eight_hours_ago.isoformat()
            response = supabase.table("articles").select(
                "id, headline, summary, published_at, url, source, label, related, full_text, tickers"
            ).gte("published_at", timestamp_str_48h).order("published_at", desc=True).limit(100).execute()
        
        # If still no articles, try last 7 days
        if not response.data or len(response.data) == 0:
            seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
            timestamp_str_7d = seven_days_ago.isoformat()
            response = supabase.table("articles").select(
                "id, headline, summary, published_at, url, source, label, related, full_text, tickers"
            ).gte("published_at", timestamp_str_7d).order("published_at", desc=True).limit(100).execute()
        
        # If still no articles, get the most recent 20 articles regardless of date
        if not response.data or len(response.data) == 0:
            response = supabase.table("articles").select(
                "id, headline, summary, published_at, url, source, label, related, full_text, tickers"
            ).order("published_at", desc=True).limit(20).execute()
        
        if not response.data or len(response.data) == 0:
            return {"articles": [], "count": 0}
        
        articles_with_tickers = []
        
        # Process articles and add recommendations
        for article in response.data:
            # Get tickers from database (stored as comma-separated string)
            tickers_str = article.get('tickers', '')
            tickers = tickers_str.split(',') if tickers_str else []
            
            # If no tickers were stored, try extracting them now (fallback)
            if not tickers:
                headline = article.get('headline', '') or ''
                summary = article.get('summary', '') or ''
                full_text = article.get('full_text', '') or ''
                full_text_snippet = full_text[:500] if full_text else ''
                combined_text = f"{headline} {summary} {full_text_snippet}"
                tickers = extract_tickers_from_text(combined_text)
            
            # Generate recommendation
            recommendation = generate_recommendation(article)
            
            # Add tickers and recommendation to article
            article['tickers'] = tickers if tickers else []
            article['recommendation'] = recommendation
            
            # Include all financial articles
            articles_with_tickers.append(article)
        
        # Limit to top 20 for performance
        articles_with_tickers = articles_with_tickers[:20]
        
        return {
            "articles": articles_with_tickers,
            "count": len(articles_with_tickers)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")


@router.get("/news/{article_id}")
async def get_article_detail(article_id: str):
    """
    Get detailed information about a specific article by ID.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE environment variables.")
    
    try:
        response = supabase.table("articles").select("*").eq("id", article_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Article not found")
        
        article = response.data[0]
        
        # Get tickers from database or extract them
        tickers_str = article.get('tickers', '')
        tickers = tickers_str.split(',') if tickers_str else []
        
        if not tickers:
            headline = article.get('headline', '')
            summary = article.get('summary', '')
            full_text = article.get('full_text', '')
            combined_text = f"{headline} {summary} {full_text[:500]}"
            tickers = extract_tickers_from_text(combined_text)
        
        recommendation = generate_recommendation(article)
        
        article['tickers'] = tickers
        article['recommendation'] = recommendation
        
        return article
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching article: {str(e)}")


@router.get("/news/ticker/{ticker}")
async def get_articles_by_ticker(ticker: str, hours: int = 24, limit: int = 50):
    """
    Get all articles mentioning a specific stock ticker.
    
    Args:
        ticker: Stock ticker symbol (e.g., "AAPL", "NVDA", "TSLA")
        hours: Number of hours to look back (default: 24, max: 168 for 7 days)
        limit: Maximum number of articles to return (default: 50, max: 100)
    
    Returns:
        List of articles containing the specified ticker with recommendations
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE environment variables.")
    
    # Validate and sanitize inputs
    ticker = ticker.upper().strip()
    if not ticker or len(ticker) > 5:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol")
    
    # Limit the time range
    hours = min(max(1, hours), 168)  # Between 1 hour and 7 days
    limit = min(max(1, limit), 100)  # Between 1 and 100 articles
    
    try:
        # Calculate timestamp
        time_threshold = datetime.now(timezone.utc) - timedelta(hours=hours)
        timestamp_str = time_threshold.isoformat()
        
        # Search for ticker in the tickers column (comma-separated) and other text fields
        # Using ilike for case-insensitive pattern matching
        response = supabase.table("articles").select(
            "id, headline, summary, published_at, url, source, label, related, full_text, tickers"
        ).or_(
            f"tickers.ilike.%{ticker}%,headline.ilike.%{ticker}%,summary.ilike.%{ticker}%,full_text.ilike.%{ticker}%"
        ).gte("published_at", timestamp_str).order("published_at", desc=True).limit(limit).execute()
        
        # If no articles found in time range, try without time constraint but limit to recent
        if not response.data or len(response.data) == 0:
            response = supabase.table("articles").select(
                "id, headline, summary, published_at, url, source, label, related, full_text, tickers"
            ).or_(
                f"tickers.ilike.%{ticker}%,headline.ilike.%{ticker}%,summary.ilike.%{ticker}%,full_text.ilike.%{ticker}%"
            ).order("published_at", desc=True).limit(limit).execute()
        
        if not response.data:
            return {
                "ticker": ticker,
                "articles": [],
                "count": 0,
                "time_range_hours": hours
            }
        
        articles_list = []
        
        # Process each article
        for article in response.data:
            # Get tickers from database
            tickers_str = article.get('tickers', '')
            tickers = tickers_str.split(',') if tickers_str else []
            
            # If no tickers stored, extract them
            if not tickers:
                headline = article.get('headline', '') or ''
                summary = article.get('summary', '') or ''
                full_text = article.get('full_text', '') or ''
                full_text_snippet = full_text[:500] if full_text else ''
                combined_text = f"{headline} {summary} {full_text_snippet}"
                tickers = extract_tickers_from_text(combined_text)
            
            # Only include if the requested ticker is actually present
            if ticker in tickers or ticker.upper() in [t.upper() for t in tickers]:
                recommendation = generate_recommendation(article)
                article['tickers'] = tickers
                article['recommendation'] = recommendation
                articles_list.append(article)
        
        return {
            "ticker": ticker,
            "articles": articles_list,
            "count": len(articles_list),
            "time_range_hours": hours
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching articles for ticker: {str(e)}")

