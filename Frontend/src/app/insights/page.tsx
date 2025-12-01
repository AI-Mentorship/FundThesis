'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StockTicker from '@/components/StockTicker';
import NewsArticleModal from '@/components/NewsArticleModal';
import { fetchRecentNews, NewsArticle } from '@/lib/api';

export default function InsightsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching news from:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000');
        const response = await fetchRecentNews();
        console.log('News response:', response);
        
        if (response.articles.length === 0) {
          setError(null); // No error, just no articles
          console.log('No articles found in response');
        }
        
        setArticles(response.articles || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load news articles. Please try again later.';
        setError(errorMessage);
        console.error('Error loading news:', err);
        setArticles([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const getRecommendationBadgeColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Sell':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <StockTicker />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Insights</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          AI-powered market analysis and stock recommendations
        </p>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Market Summary</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Markets showed positive momentum today with tech stocks leading the gains. 
              AI and semiconductor sectors continue to attract investor attention.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Recommendations</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Based on your portfolio and risk profile, consider diversifying into 
              emerging markets and renewable energy sectors.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent News & Sentiment</h3>
            </div>
            
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading news...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            
            {!loading && !error && articles.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  No recent news articles found.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-2xl mx-auto mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                    ⚠️ Make sure the backend server is running:
                  </p>
                  <code className="block mt-2 text-xs bg-yellow-100 dark:bg-yellow-900 p-2 rounded text-yellow-900 dark:text-yellow-100">
                    cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
                  </code>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>To populate articles:</strong> Run the web scraper from the backend directory:
                  </p>
                  <code className="block mt-2 text-xs bg-blue-100 dark:bg-blue-900 p-2 rounded text-blue-900 dark:text-blue-100">
                    cd backend/webScraper && python main.py
                  </code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  This will scrape articles from Finnhub and RSS feeds and store them in your database.
                </p>
              </div>
            )}
            
            {!loading && !error && articles.length > 0 && (
              <div className="space-y-3">
                {articles.map((article) => {
                  const sentiment = article.sentiment_label || article.label || 'Neutral';
                  const sentimentLower = sentiment.toLowerCase();
                  const percentage = article.sentiment_percentage || 85;
                  const isPositive = sentimentLower === 'positive';
                  const isNegative = sentimentLower === 'negative';
                  const dotColor = isPositive 
                    ? 'bg-green-600' 
                    : isNegative 
                    ? 'bg-amber-700' 
                    : 'bg-gray-500';
                  const sentimentColor = isPositive 
                    ? 'text-green-600 dark:text-green-500' 
                    : isNegative 
                    ? 'text-amber-700 dark:text-amber-500' 
                    : 'text-gray-600 dark:text-gray-400';
                  
                  return (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 ${dotColor}`}></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                            {article.headline}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>{formatDate(article.published_at)}</span>
                            <span>•</span>
                            <span className={`font-medium ${sentimentColor}`}>
                              {sentiment} ({percentage}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Recommendation:</span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRecommendationBadgeColor(
                                article.recommendation
                              )}`}
                            >
                              {article.recommendation}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <NewsArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}