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
            "id, headline, summary, published_at, url, source, label, related, full_text"
        ).gte("published_at", timestamp_str).order("published_at", desc=True).limit(100).execute()
        
        # If no articles in last 24h, try last 48 hours
        if not response.data or len(response.data) == 0:
            forty_eight_hours_ago = datetime.now(timezone.utc) - timedelta(hours=48)
            timestamp_str_48h = forty_eight_hours_ago.isoformat()
            response = supabase.table("articles").select(
                "id, headline, summary, published_at, url, source, label, related, full_text"
            ).gte("published_at", timestamp_str_48h).order("published_at", desc=True).limit(100).execute()
        
        # If still no articles, try last 7 days
        if not response.data or len(response.data) == 0:
            seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
            timestamp_str_7d = seven_days_ago.isoformat()
            response = supabase.table("articles").select(
                "id, headline, summary, published_at, url, source, label, related, full_text"
            ).gte("published_at", timestamp_str_7d).order("published_at", desc=True).limit(100).execute()
        
        # If still no articles, get the most recent 20 articles regardless of date
        if not response.data or len(response.data) == 0:
            response = supabase.table("articles").select(
                "id, headline, summary, published_at, url, source, label, related, full_text"
            ).order("published_at", desc=True).limit(20).execute()
        
        if not response.data or len(response.data) == 0:
            return {"articles": [], "count": 0}
        
        articles_with_tickers = []
        
        # Filter articles that mention retail-tradeable stocks
        for article in response.data:
            # Check if article mentions any major tickers
            headline = article.get('headline', '') or ''
            summary = article.get('summary', '') or ''
            full_text = article.get('full_text', '') or ''
            
            # Combine text to search for tickers (limit full_text to avoid too long strings)
            full_text_snippet = full_text[:500] if full_text else ''
            combined_text = f"{headline} {summary} {full_text_snippet}"
            tickers = extract_tickers_from_text(combined_text)
            
            # Generate recommendation regardless of ticker match
            recommendation = generate_recommendation(article)
            
            # Add tickers and recommendation to article
            # If no tickers found, still include the article but with empty tickers array
            article['tickers'] = tickers if tickers else []
            article['recommendation'] = recommendation
            
            # Include all financial articles, not just those with tickers
            # This ensures we show relevant financial news even if ticker detection fails
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
        
        # Extract tickers and generate recommendation
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

