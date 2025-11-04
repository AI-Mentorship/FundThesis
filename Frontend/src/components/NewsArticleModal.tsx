'use client';

import React from 'react';
import { NewsArticle } from '@/lib/api';

interface NewsArticleModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsArticleModal({ article, isOpen, onClose }: NewsArticleModalProps) {
  if (!isOpen || !article) return null;

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Sell':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {article.headline}
            </h2>
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600 dark:text-gray-400">
              <span>{article.source}</span>
              <span>•</span>
              <span>{formatDate(article.published_at)}</span>
              {article.tickers.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-1 flex-wrap">
                    {article.tickers.map((ticker) => (
                      <span
                        key={ticker}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium"
                      >
                        {ticker}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          {article.summary && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {article.summary}
              </p>
            </div>
          )}

          {/* Full Text */}
          {article.full_text && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Full Article
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {article.full_text.length > 2000
                  ? `${article.full_text.substring(0, 2000)}...`
                  : article.full_text}
              </p>
            </div>
          )}

          {/* Recommendation */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Actionable Recommendation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on sentiment analysis and article content
                </p>
              </div>
              <div
                className={`px-6 py-3 rounded-lg border-2 font-bold text-lg ${getRecommendationColor(
                  article.recommendation
                )}`}
              >
                {article.recommendation}
              </div>
            </div>
          </div>

          {/* External Link */}
          {article.url && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Read full article
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

