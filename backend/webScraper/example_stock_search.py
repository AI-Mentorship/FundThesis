#!/usr/bin/env python3
"""
Example usage of the stock article search functionality.
This script demonstrates how to search for articles about specific stocks.
"""

from news_feeds import get_stock_articles_last_24h, get_stock_articles_by_ticker

def example_stock_search():
    """Example of searching for stock-related articles."""
    
    print("=" * 80)
    print("Example: Searching for Apple (AAPL) articles from the last 24 hours")
    print("=" * 80)
    
    # Search for Apple articles
    apple_articles = get_stock_articles_last_24h("AAPL")
    
    if apple_articles:
        print(f"\n✓ Found {len(apple_articles)} articles about Apple")
        for i, article in enumerate(apple_articles[:3], 1):  # Show first 3
            print(f"\n{i}. {article.get('headline', 'No headline')}")
            print(f"   URL: {article.get('url', 'No URL')}")
            print(f"   Sentiment: {article.get('label', 'N/A')}")
    else:
        print("\n✗ No articles found")
    
    print("\n" + "=" * 80)
    print("Example: Searching for NVIDIA articles with custom time range (48 hours)")
    print("=" * 80)
    
    # Search for NVIDIA articles in the last 48 hours
    nvidia_articles = get_stock_articles_by_ticker("NVDA", hours=48)
    
    if nvidia_articles:
        print(f"\n✓ Found {len(nvidia_articles)} articles about NVIDIA")
    else:
        print("\n✗ No articles found")
    
    print("\n" + "=" * 80)
    print("Example: Searching for Tesla articles")
    print("=" * 80)
    
    # Search for Tesla articles
    tesla_articles = get_stock_articles_by_ticker("TSLA", hours=24)
    
    if tesla_articles:
        print(f"\n✓ Found {len(tesla_articles)} articles about Tesla")
    else:
        print("\n✗ No articles found")

if __name__ == "__main__":
    example_stock_search()

