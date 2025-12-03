"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import NewsArticleModal from "@/components/NewsArticleModal";
import MarkdownContent from "@/components/MarkdownContent";
import { fetchArticlesFromSupabase, NewsArticle } from "@/lib/api";

// Cache configuration
const CACHE_KEY = "fundthesis_insights_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache helper functions
const getCachedInsights = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { marketSummary, aiRecommendations, timestamp } = JSON.parse(cached);
    const now = Date.now();
    const age = now - timestamp;

    // Check if cache is still valid (less than 24 hours old)
    if (age < CACHE_DURATION) {
      console.log(
        "Using cached insights (age:",
        Math.round(age / 1000 / 60),
        "minutes)"
      );
      return { marketSummary, aiRecommendations };
    } else {
      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      console.log("Cache expired, fetching new insights");
      return null;
    }
  } catch (error) {
    console.error("Error reading cache:", error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedInsights = (
  marketSummary: string,
  aiRecommendations: string
) => {
  try {
    const cacheData = {
      marketSummary,
      aiRecommendations,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("Insights cached successfully");
  } catch (error) {
    console.error("Error caching insights:", error);
  }
};

export default function InsightsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marketSummary, setMarketSummary] = useState<string>("");
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching articles from Supabase...");
        const response = await fetchArticlesFromSupabase({
          limit: 50,
          offset: 0,
          orderBy: "published_at",
          orderDirection: "desc",
        });
        console.log("Articles response:", response);

        if (response.articles.length === 0) {
          setError(null); // No error, just no articles
          console.log("No articles found in response");
        }

        setArticles(response.articles || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load news articles. Please try again later.";
        setError(errorMessage);
        console.error("Error loading news:", err);
        setArticles([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setInsightsLoading(true);

        // Check cache first
        const cached = getCachedInsights();
        if (cached) {
          setMarketSummary(cached.marketSummary);
          setAiRecommendations(cached.aiRecommendations);
          setInsightsLoading(false);
          return;
        }

        // Cache miss or expired, fetch new data
        console.log("Fetching insights from API...");
        const response = await fetch("/api/insights?type=both", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch insights: ${response.status}`);
        }

        const data = await response.json();
        console.log("Insights response:", data);

        const summary =
          data.market_summary ||
          "Markets showed positive momentum today with tech stocks leading the gains. AI and semiconductor sectors continue to attract investor attention.";
        const recommendations =
          data.ai_recommendations ||
          "Based on your portfolio and risk profile, consider diversifying into emerging markets and renewable energy sectors.";

        setMarketSummary(summary);
        setAiRecommendations(recommendations);

        // Cache the new data
        setCachedInsights(summary, recommendations);
      } catch (err) {
        console.error("Error loading insights:", err);
        // Use fallback content on error
        const fallbackSummary =
          "Markets showed positive momentum today with tech stocks leading the gains. AI and semiconductor sectors continue to attract investor attention.";
        const fallbackRecommendations =
          "Based on your portfolio and risk profile, consider diversifying into emerging markets and renewable energy sectors.";

        setMarketSummary(fallbackSummary);
        setAiRecommendations(fallbackRecommendations);
      } finally {
        setInsightsLoading(false);
      }
    };

    loadInsights();
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
      case "Buy":
        return "bg-green-100 text-green-800";
      case "Sell":
        return "bg-red-100 text-red-800";
      case "Hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Insights</h1>
            <p className="text-xl text-gray-600">
              AI-powered market analysis and stock recommendations
            </p>
          </div>
          {/* <button
            onClick={() => {
              localStorage.removeItem(CACHE_KEY);
              window.location.reload();
            }}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            title="Clear cache and refresh"
          >
            Clear Cache
          </button> */}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Market Summary
            </h3>
            {insightsLoading ? (
              <div className="flex items-center gap-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <p className="text-gray-600">Generating market summary...</p>
              </div>
            ) : (
              <MarkdownContent content={marketSummary} />
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Recommendations
            </h3>
            {insightsLoading ? (
              <div className="flex items-center gap-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <p className="text-gray-600">
                  Generating AI recommendations...
                </p>
              </div>
            ) : (
              <MarkdownContent content={aiRecommendations} />
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent News & Sentiment
              </h3>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Loading news...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {!loading && !error && articles.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-600">No recent news articles found.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                  <p className="text-sm text-blue-800">
                    Articles are loaded from your Supabase database. Make sure
                    articles have been populated in the{" "}
                    <code className="bg-blue-100 px-1 rounded">articles</code>{" "}
                    table.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && articles.length > 0 && (
              <div className="space-y-3">
                {articles.map((article) => {
                  const sentiment =
                    article.sentiment_label || article.label || "Neutral";
                  const sentimentLower = sentiment.toLowerCase();
                  const percentage = article.sentiment_percentage || 85;
                  const isPositive = sentimentLower === "positive";
                  const isNegative = sentimentLower === "negative";
                  const dotColor = isPositive
                    ? "bg-green-600"
                    : isNegative
                    ? "bg-amber-700"
                    : "bg-gray-500";
                  const sentimentColor = isPositive
                    ? "text-green-600"
                    : isNegative
                    ? "text-amber-700"
                    : "text-gray-600";

                  return (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2.5 shrink-0 ${dotColor}`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                            {article.headline}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>{formatDate(article.published_at)}</span>
                            <span>•</span>
                            <span className={`font-medium ${sentimentColor}`}>
                              {sentiment} ({percentage}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Recommendation:
                            </span>
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
