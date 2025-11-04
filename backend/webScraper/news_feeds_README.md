# News Feeds Scraper

## Overview
The `news_feeds.py` script fetches articles from business news RSS feeds and stores them in your Supabase database with sentiment analysis and full-text content.

## Supported Feeds
- **BusinessWire** ✓ (Personal filtered feed - Pre-filtered by BusinessWire)
- **PR Newswire** ✓ (Filtered using financial keywords)
- **GlobeNewswire** ⚠️ (Disabled - returns 404 Not Found)

**Note**: 
- BusinessWire uses a personal filtered RSS feed that is already pre-filtered for financial content, so no additional filtering is needed.
- PR Newswire is filtered using a comprehensive financial keyword list.
- GlobeNewswire has implemented anti-bot measures that block automated access.

## Features
- Fetches articles from RSS feeds
- **Filters for articles from yesterday and today only** (no older articles)
- **Filters for English-language articles only** (skips non-English content)
- **Filters for financial news only** using keyword matching
- Scrapes full article content using multiple extractors
- Performs sentiment analysis using FinBERT
- Stores articles in Supabase with metadata
- Avoids duplicate entries
- **Stock-specific article search** functionality
- Handles errors gracefully

## Usage

### Running Once
```bash
cd backend/webScraper
python news_feeds.py
```

### Running Periodically
You can set up a cron job or systemd timer to run this script periodically (e.g., every 15-30 minutes):

**Cron example (every 30 minutes):**
```bash
*/30 * * * * cd /path/to/FundThesis-2/backend/webScraper && python news_feeds.py >> /path/to/logs/news_feeds.log 2>&1
```

### Integration with Your Codebase
You can also import and call the functions programmatically:

```python
from news_feeds import ingest_all_feeds, get_stock_articles_by_ticker

# Process all feeds
total_inserted = ingest_all_feeds()

# Search for stock-specific articles
apple_articles = get_stock_articles_by_ticker("AAPL", hours=24)
```

## Dependencies
- `feedparser`: For parsing RSS feeds
- `requests`: For HTTP requests
- Functions from `utils.py`: `get_fulltext()` and `insert_into_supabase()`

## Output
The script will:
1. Fetch RSS feeds from all three sources
2. Parse each article
3. Scrape the full article content from the article URL
4. Analyze sentiment using FinBERT
5. Insert into Supabase with the following fields:
   - Headline
   - Summary
   - Full text
   - Published date
   - Category (if available)
   - Source (BusinessWire, GlobeNewswire, or PR Newswire)
   - URL
   - Sentiment label
   - Fetch status and metadata

## Enabling Disabled Feeds
To enable BusinessWire or GlobeNewswire feeds, edit `news_feeds.py` and set `"enabled": True` for the desired feed:

```python
{
    "name": "BusinessWire",
    "url": "https://www.businesswire.com/rss/home/",
    "enabled": True  # Change from False to True
}
```

**Warning**: These feeds may return 403/404 errors due to anti-bot protections. You may need to implement additional measures like:
- Better User-Agent headers
- Request delays
- Browser automation (Selenium)
- Official API access from the news providers

## Environment Variables
Make sure you have the following environment variables set:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE`: Your Supabase service role key

## Error Handling
The script handles:
- Failed feed fetches (continues to next feed)
- Failed article scraping (logs error, continues to next article)
- Duplicate entries (skips articles already seen in this session)
- Network timeouts (retries configured in `utils.py`)

## Stock-Specific Article Search

The script includes functions to search for articles about specific stocks:

### `get_stock_articles_by_ticker(ticker, hours=24)`
Search for articles about a specific stock ticker within a configurable time range.

**Arguments:**
- `ticker` (str): Stock ticker symbol (e.g., "AAPL", "NVDA", "TSLA")
- `hours` (int): Number of hours to look back (default: 24)

**Returns:**
- List of article dictionaries with headline, URL, sentiment, published date, etc.

**Example:**
```python
from news_feeds import get_stock_articles_by_ticker

# Get NVIDIA articles from the last 24 hours
nvda_articles = get_stock_articles_by_ticker("NVDA", hours=24)

# Get Apple articles from the last 48 hours
aapl_articles = get_stock_articles_by_ticker("AAPL", hours=48)
```

### `get_stock_articles_last_24h(stock_name)`
Same functionality as above but fixed to 24-hour window.

**Example:**
```python
from news_feeds import get_stock_articles_last_24h

# Search for articles about a company
articles = get_stock_articles_last_24h("Apple")
```

See `example_stock_search.py` for more usage examples.

## Financial News Filtering

Articles are automatically filtered to only include financial news. There are two types of feeds:

### Pre-filtered Feeds
- **BusinessWire**: Uses a personal RSS feed that is already pre-filtered by BusinessWire for financial content. No additional filtering is applied.

### Keyword-filtered Feeds
- **PR Newswire**: Articles are filtered using a comprehensive keyword list that includes:
  - Stock market terms (stock, equity, trading, NASDAQ, NYSE)
  - Financial metrics (earnings, revenue, profit, quarterly)
  - Corporate actions (merger, acquisition, IPO, dividend)
  - Market analysis terms (analyst, guidance, forecast)

Non-financial articles from keyword-filtered feeds are skipped during ingestion.

## Language Filtering

The script automatically filters articles to only include those written in **English**. This ensures consistent language for sentiment analysis and readability.

- Articles are checked for common English words in their headline and summary
- Non-English articles are skipped with a log message
- Uses a simple heuristic that checks for at least 2 common English words

Example output:
```
[BusinessWire] Skipping non-English article: Example Article Title in Another Language...
```

## Date Filtering

The script automatically filters articles to only include those from **yesterday and today**. This ensures you only get recent, relevant financial news.

- Articles older than yesterday are skipped
- Articles with invalid or missing dates are skipped
- Date range is printed in the console output for transparency

Example output:
```
[BusinessWire] Filtering for articles from 2025-10-29 to 2025-10-30
[BusinessWire] Skipping old article from 2025-10-28: Example Article Title...
```

## Notes
- The script uses an in-memory cache (`SEEN` set) to avoid duplicates within a single run
- For production use, duplicates should be handled by the database (using `url` as unique constraint)
- The script includes a 2-second delay between feeds to be respectful to the RSS servers
- Financial keyword filtering can be customized by modifying the `FINANCIAL_KEYWORDS` set in the code

