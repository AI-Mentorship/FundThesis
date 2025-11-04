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

