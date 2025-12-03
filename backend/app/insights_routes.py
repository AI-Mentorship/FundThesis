"""API routes for generating market insights using LangChain."""
from fastapi import APIRouter, HTTPException
from typing import Optional
import os
from datetime import datetime, timedelta, timezone
from supabase import create_client, Client
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from rag.rag import RAG

router = APIRouter()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.environ.get("SUPABASE_SERVICE_ROLE")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

# Initialize RAG instance
rag = RAG()


def get_recent_articles(limit: int = 50, hours: int = 24) -> list:
    """Fetch recent articles from Supabase for analysis."""
    try:
        time_threshold = datetime.now(timezone.utc) - timedelta(hours=hours)
        timestamp_str = time_threshold.isoformat()
        
        response = supabase.table("articles").select(
            "headline, summary, label, source, published_at, tickers"
        ).gte("published_at", timestamp_str).order("published_at", desc=True).limit(limit).execute()
        
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching articles: {e}")
        return []


def format_articles_for_prompt(articles: list) -> str:
    """Format articles into a readable string for the LLM prompt."""
    if not articles:
        return "No recent articles available."
    
    formatted = []
    for article in articles:
        headline = article.get("headline", "No headline")
        summary = article.get("summary", "")
        sentiment = article.get("label", "neutral")
        source = article.get("source", "Unknown")
        tickers = article.get("tickers", "")
        
        formatted.append(
            f"Headline: {headline}\n"
            f"Summary: {summary[:200] if summary else 'No summary'}\n"
            f"Sentiment: {sentiment}\n"
            f"Source: {source}\n"
            f"Tickers: {tickers}\n"
            f"---"
        )
    
    return "\n".join(formatted)


@router.get("/insights/market-summary")
async def get_market_summary():
    """Generate a market summary using LangChain based on recent articles."""
    try:
        # Fetch recent articles
        articles = get_recent_articles(limit=30, hours=24)
        
        if not articles:
            return {
                "summary": "No recent market news available. Please check back later for market updates.",
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
        
        # Format articles for prompt
        articles_text = format_articles_for_prompt(articles)
        
        # Create prompt for market summary
        prompt = f"""Based on the following recent financial news articles, provide a concise market summary (2-3 sentences) that highlights:
1. Overall market trends and momentum
2. Key sectors or stocks showing significant movement
3. Notable market sentiment

Recent Articles:
{articles_text}

Provide a clear, professional market summary:"""

        # Generate summary using LangChain
        summary = await rag.a_call(prompt)
        
        return {
            "summary": summary.strip(),
            "articles_analyzed": len(articles),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        print(f"Error generating market summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate market summary: {str(e)}")


@router.get("/insights/ai-recommendations")
async def get_ai_recommendations():
    """Generate AI-powered investment recommendations using LangChain based on recent articles."""
    try:
        # Fetch recent articles
        articles = get_recent_articles(limit=30, hours=24)
        
        if not articles:
            return {
                "recommendations": "Insufficient market data available. Please check back later for investment recommendations.",
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
        
        # Format articles for prompt
        articles_text = format_articles_for_prompt(articles)
        
        # Create prompt for AI recommendations
        prompt = f"""Based on the following recent financial news articles, provide personalized investment recommendations (2-3 sentences) that include:
1. Portfolio diversification suggestions
2. Sectors or themes to consider
3. Risk considerations

Recent Articles:
{articles_text}

Provide clear, actionable investment recommendations:"""

        # Generate recommendations using LangChain
        recommendations = await rag.a_call(prompt)
        
        return {
            "recommendations": recommendations.strip(),
            "articles_analyzed": len(articles),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        print(f"Error generating AI recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate AI recommendations: {str(e)}")


@router.get("/insights/both")
async def get_both_insights():
    """Get both market summary and AI recommendations in one call."""
    try:
        market_summary = await get_market_summary()
        ai_recommendations = await get_ai_recommendations()
        
        return {
            "market_summary": market_summary["summary"],
            "ai_recommendations": ai_recommendations["recommendations"],
            "articles_analyzed": market_summary.get("articles_analyzed", 0),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        print(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

