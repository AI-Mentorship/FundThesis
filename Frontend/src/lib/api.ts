// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  published_at: string;
  url: string;
  source: string;
  label: string | null;
  related: string | null;
  full_text: string | null;
  tickers: string[];
  recommendation: 'Buy' | 'Hold' | 'Sell';
  sentiment_label?: string;
  sentiment_percentage?: number;
}

export interface NewsResponse {
  articles: NewsArticle[];
  count: number;
}

export async function fetchRecentNews(): Promise<NewsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/news/recent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Ensure articles array exists and has proper structure
    if (!data || !Array.isArray(data.articles)) {
      console.warn('Unexpected API response format:', data);
      return { articles: [], count: 0 };
    }

    // Ensure each article has required fields with defaults
    const normalizedArticles = data.articles.map((article: any) => ({
      ...article,
      tickers: article.tickers || [],
      recommendation: article.recommendation || 'Hold',
      summary: article.summary || '',
      full_text: article.full_text || null,
    }));

    return {
      articles: normalizedArticles,
      count: data.count || normalizedArticles.length,
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    // Return empty array instead of throwing to prevent page crash
    return { articles: [], count: 0 };
  }
}

export async function fetchArticleDetail(articleId: string): Promise<NewsArticle> {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${articleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching article detail:', error);
    throw error;
  }
}

// New function to fetch articles from Supabase via the frontend API
export async function fetchArticlesFromSupabase(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  source?: string;
  tickers?: string;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}): Promise<NewsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.tickers) queryParams.append('tickers', params.tickers);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params?.orderDirection) queryParams.append('orderDirection', params.orderDirection);

    const response = await fetch(`/api/articles?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Supabase articles to match NewsArticle interface
    const normalizedArticles: NewsArticle[] = (data.articles || []).map((article: any) => {
      // Parse tickers from text to array
      let tickersArray: string[] = [];
      if (article.tickers) {
        if (typeof article.tickers === 'string') {
          // Try to parse as JSON first, then fall back to comma-separated
          try {
            const parsed = JSON.parse(article.tickers);
            tickersArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If not JSON, treat as comma-separated string
            tickersArray = article.tickers
              .split(',')
              .map((t: string) => t.trim())
              .filter((t: string) => t.length > 0);
          }
        } else if (Array.isArray(article.tickers)) {
          tickersArray = article.tickers;
        }
      }

      // Derive sentiment from label field
      const label = article.label?.toLowerCase() || 'neutral';
      const sentimentLabel = label === 'positive' || label === 'negative' || label === 'neutral' 
        ? label.charAt(0).toUpperCase() + label.slice(1)
        : 'Neutral';

      // Derive recommendation from sentiment (simple heuristic)
      let recommendation: 'Buy' | 'Hold' | 'Sell' = 'Hold';
      if (label === 'positive') {
        recommendation = 'Buy';
      } else if (label === 'negative') {
        recommendation = 'Sell';
      }

      return {
        id: article.id,
        headline: article.headline || 'No headline',
        summary: article.summary || '',
        published_at: article.published_at || article.inserted_at || new Date().toISOString(),
        url: article.url || '#',
        source: article.source || 'Unknown',
        label: article.label,
        related: article.related,
        full_text: article.full_text,
        tickers: tickersArray,
        recommendation,
        sentiment_label: sentimentLabel,
        sentiment_percentage: label === 'positive' ? 75 : label === 'negative' ? 75 : 50,
      };
    });

    return {
      articles: normalizedArticles,
      count: data.total || normalizedArticles.length,
    };
  } catch (error) {
    console.error('Error fetching articles from Supabase:', error);
    // Return empty array instead of throwing to prevent page crash
    return { articles: [], count: 0 };
  }
}

