# news_feeds.py
# Pull articles from BusinessWire, GlobeNewswire, and PR Newswire RSS feeds

import time
import hashlib
import requests
import feedparser
from datetime import datetime, timezone, timedelta
import re

# Import from utils.py to reuse scraping, sentiment, DB insert
from utils import get_fulltext, insert_into_supabase, supabase

# RSS feed URLs
FEEDS = [
    {
        "name": "BusinessWire",
        "url": "https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeEFpRXEMGSQ5SVFJTGEdfGENeUldDFUkQUhFUVFhTFEQ=",  # Personal filtered feed for FundThesis
        "enabled": True,  # Personal filtered feed - no need to filter
        "needs_filtering": False  # Pre-filtered by BusinessWire
    },
    {
        "name": "GlobeNewswire",
        "url": "https://www.globenewswire.com/RssFeed/org",
        "enabled": False,  # May return 404
        "needs_filtering": True
    },
    {
        "name": "PR Newswire",
        "url": "https://www.prnewswire.com/rss/news-releases-list.rss",
        "enabled": True,  # Confirmed working
        "needs_filtering": True  # Needs financial news filtering
    }
]

# Keep track of seen items to avoid duplicates
SEEN = set()

# Financial keywords for filtering relevant news
FINANCIAL_KEYWORDS = {
    'stock', 'stocks', 'equity', 'equities', 'NASDAQ', 'NYSE', 'trading', 'trade',
    'earnings', 'revenue', 'profit', 'loss', 'quarterly', 'Q1', 'Q2', 'Q3', 'Q4',
    'forecast', 'guidance', 'dividend', 'dividends', 'IPO', 'IPO', 'merger', 'acquisition',
    'investor', 'investment', 'portfolio', 'market', 'markets', 'share', 'shares',
    'financial', 'finance', 'bank', 'banking', 'fund', 'hedge fund', 'ETF', 'mutual fund',
    'analyst', 'Dow', 'S&P', 'index', 'indices', 'cryptocurrency', 'bitcoin', 'BTC',
    'crypto', 'blockchain', 'FDA approval', 'clinical trial', 'biotech', 'pharma',
    'CEO', 'CFO', 'executive', 'board', 'outlook', 'expenses', 'income',
    'balance sheet', 'cash flow', 'securities', 'bond', 'bonds', 'debt', 'credit'
}

def gen_id_from(text: str) -> str:
    """Generate a stable ID for an item."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

def is_financial_news(headline: str, summary: str = "", full_text: str = "") -> bool:
    """
    Check if an article is related to finance/stock market.
    Returns True if contains financial keywords.
    """
    combined_text = f"{headline} {summary} {full_text}".lower()
    
    # Count how many financial keywords appear
    keyword_count = sum(1 for keyword in FINANCIAL_KEYWORDS if keyword.lower() in combined_text)
    
    # Consider it financial if at least 1 keyword matches
    return keyword_count >= 1

def looks_like_english(text: str) -> bool:
    """
    Simple heuristic to check if text appears to be English.
    Checks for common English words and character patterns.
    """
    if not text:
        return True
    
    text_lower = text.lower()
    
    # Check for common English words
    english_words = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
                     'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
                     'man', 'new', 'now', 'old', 'see', 'two', 'who', 'its', 'may', 'way',
                     'com', 'from', 'news', 'financ']
    
    word_count = sum(1 for word in english_words if word in text_lower)
    
    # If we find at least 2 common English words, likely English
    return word_count >= 2

def fetch_feed(url: str, feed_name: str):
    """Fetch and parse an RSS feed."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/rss+xml,application/xml,text/xml"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        return feedparser.parse(resp.text)
    except Exception as e:
        print(f"[{feed_name}] Error fetching feed: {e}")
        return None

def normalize_entry(entry: dict, source: str) -> dict:
    """
    Convert a feedparser entry to our article_db format.
    Handles different feed structures from BusinessWire, GlobeNewswire, and PR Newswire.
    """
    headline = entry.get("title", "").strip()
    url = entry.get("link", "").strip()
    published_raw = entry.get("published", "") or entry.get("pubDate", "")
    
    # Convert published date to ISO format
    published_iso = None
    try:
        # feedparser usually parses dates automatically
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            published_iso = dt.isoformat()
        elif published_raw:
            # Try to parse if feedparser didn't
            dt = datetime.fromisoformat(
                published_raw
                .replace("Z", "+00:00")
            )
            published_iso = dt.astimezone(timezone.utc).isoformat()
    except Exception:
        published_iso = None
    
    # Get summary/description
    summary = entry.get("summary", "") or entry.get("description", "")
    # Clean HTML tags from summary
    if summary:
        summary = re.sub(r'<[^>]+>', '', summary).strip()
    
    # Generate stable ID from URL and title
    local_id = gen_id_from(url + headline)
    
    # Try to extract category/topic
    category = None
    tags = entry.get("tags", [])
    if tags and isinstance(tags, list):
        # Get first tag's term
        for tag in tags:
            if isinstance(tag, dict) and 'term' in tag:
                category = tag['term']
                break
    
    article_db = {
        "id": local_id,
        "headline": headline,
        "summary": summary or headline[:200],  # Fallback to headline if no summary
        "datetime": published_iso,
        "category": category,
        "related": None,  # Can be populated later with company tickers
        "source": source,
        "url": url,
    }
    return article_db

def ingest_feed_once(feed_info: dict):
    """Fetch a feed, normalize entries, scrape content, and insert into Supabase."""
    feed_name = feed_info["name"]
    feed_url = feed_info["url"]
    
    # Calculate date range: yesterday and today
    now = datetime.now(timezone.utc)
    yesterday_start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    print(f"\n[{feed_name}] Fetching feed from {feed_url}...")
    print(f"[{feed_name}] Filtering for articles from {yesterday_start.date()} to {now.date()}")
    feed = fetch_feed(feed_url, feed_name)
    
    if not feed or not hasattr(feed, 'entries'):
        print(f"[{feed_name}] No entries found or error parsing feed")
        return 0
    
    new_count = 0
    for entry in feed.entries:
        # Check if article is from yesterday or today
        article_db = normalize_entry(entry, feed_name)
        
        # Parse the article's published date
        article_date = None
        if article_db.get('datetime'):
            try:
                # published_iso is already a timezone-aware ISO string from normalize_entry
                article_date = datetime.fromisoformat(article_db['datetime'])
                # Ensure timezone-aware
                if article_date.tzinfo is None:
                    article_date = article_date.replace(tzinfo=timezone.utc)
            except Exception as e:
                print(f"[{feed_name}] Error parsing date: {e}")
                pass
        
        # Skip articles outside the date range
        if article_date is None or article_date < yesterday_start or article_date > now:
            if article_date:
                print(f"[{feed_name}] Skipping old article from {article_date.date()}: {article_db['headline'][:50]}...")
            else:
                print(f"[{feed_name}] Skipping article with invalid date: {article_db['headline'][:50]}...")
            continue
        
        # Check if article appears to be in English
        article_text_sample = f"{article_db['headline']} {article_db['summary']}"
        if not looks_like_english(article_text_sample):
            print(f"[{feed_name}] Skipping non-English article: {article_db['headline'][:50]}...")
            continue
        
        # Skip if already seen in this session
        if article_db["id"] in SEEN:
            continue
        SEEN.add(article_db["id"])
        
        # Get full text content from URL
        print(f"[{feed_name}] Scraping: {article_db['headline'][:60]}...")
        text, status, error, http_status, meta = get_fulltext(article_db["url"])
        
        # Check if article is financial news based on headline, summary, and full text
        # Only filter if the feed needs filtering (custom feeds may already be filtered)
        if feed_info.get("needs_filtering", True):
            if not is_financial_news(article_db['headline'], article_db['summary'], text or ""):
                print(f"[{feed_name}] Skipping non-financial article: {article_db['headline'][:60]}...")
                continue
        
        # Insert into Supabase with sentiment analysis
        try:
            insert_into_supabase(
                article_db=article_db,
                text=text,
                status=status,
                error=error,
                http_status=http_status,
                meta=meta
            )
            new_count += 1
        except Exception as e:
            print(f"[{feed_name}] Error inserting article: {e}")
    
    print(f"[{feed_name}] Inserted {new_count} new articles")
    return new_count

def ingest_all_feeds():
    """Process all RSS feeds and insert articles into Supabase."""
    total_new = 0
    for feed_info in FEEDS:
        # Skip disabled feeds
        if not feed_info.get("enabled", True):
            print(f"[{feed_info['name']}] Feed disabled, skipping...")
            continue
        
        try:
            count = ingest_feed_once(feed_info)
            total_new += count
            # Small delay between feeds to be respectful
            time.sleep(2)
        except Exception as e:
            print(f"Error processing {feed_info['name']}: {e}")
    
    print(f"\n[All Feeds] Total inserted: {total_new} articles")
    return total_new

def get_stock_articles_last_24h(stock_name: str) -> list:
    """
    Fetch all articles about a specific stock from the past 24 hours.
    
    Args:
        stock_name: The stock ticker or company name (e.g., "AAPL", "Apple", "NVIDIA")
    
    Returns:
        List of article dictionaries from Supabase
    """
    # Calculate timestamp for 24 hours ago
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    timestamp_str = twenty_four_hours_ago.isoformat()
    
    try:
        # Query Supabase for articles containing the stock name
        # We'll search in headline, summary, and related fields
        response = supabase.table("articles").select("*").or_(
            f"headline.ilike.%{stock_name}%,summary.ilike.%{stock_name}%,full_text.ilike.%{stock_name}%,related.ilike.%{stock_name}%"
        ).gte("published_at", timestamp_str).order("published_at", desc=True).execute()
        
        if response.data:
            print(f"Found {len(response.data)} articles about '{stock_name}' in the last 24 hours")
            return response.data
        else:
            print(f"No articles found about '{stock_name}' in the last 24 hours")
            return []
            
    except Exception as e:
        print(f"Error fetching stock articles: {e}")
        return []

def get_stock_articles_by_ticker(ticker: str, hours: int = 24) -> list:
    """
    Fetch articles for a specific stock ticker with a configurable time range.
    
    Args:
        ticker: Stock ticker symbol (e.g., "AAPL", "NVDA", "TSLA")
        hours: Number of hours to look back (default: 24)
    
    Returns:
        List of article dictionaries from Supabase
    """
    # Calculate timestamp
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=hours)
    timestamp_str = time_threshold.isoformat()
    
    try:
        # Search for the ticker in various fields
        response = supabase.table("articles").select("*").or_(
            f"headline.ilike.%{ticker}%,summary.ilike.%{ticker}%,full_text.ilike.%{ticker}%,related.ilike.%{ticker}%"
        ).gte("published_at", timestamp_str).order("published_at", desc=True).execute()
        
        articles = response.data if response.data else []
        
        print(f"Found {len(articles)} articles for ticker '{ticker}' in the last {hours} hours")
        
        # Format the output nicely
        for article in articles:
            print(f"\n--- {article.get('headline', 'No headline')[:80]} ---")
            print(f"Source: {article.get('source', 'Unknown')}")
            print(f"Published: {article.get('published_at', 'Unknown')}")
            print(f"Sentiment: {article.get('label', 'N/A')}")
            print(f"URL: {article.get('url', 'No URL')}")
        
        return articles
            
    except Exception as e:
        print(f"Error fetching ticker articles: {e}")
        return []

if __name__ == "__main__":
    # Process all feeds once
    # In production, run this periodically (e.g., every 15-30 minutes)
    try:
        ingest_all_feeds()
    except KeyboardInterrupt:
        print("\nStopped by user")
    except Exception as e:
        print(f"Fatal error: {e}")

