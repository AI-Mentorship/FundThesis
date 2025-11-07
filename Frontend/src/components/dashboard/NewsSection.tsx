import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { NewsCard } from '@/components/ui/NewsCard'

interface Stock {
  symbol: string
  change: string
  positive: boolean
}

interface NewsItem {
  title: string
  source: string
  text: string
  stocks: Stock[]
}

interface NewsSectionProps {
  newsItems: NewsItem[]
  className?: string
}

export function NewsSection({ newsItems, className = "" }: NewsSectionProps) {
  return (
    <Card className={className}>
      <CardContent>
        <h2 className="text-xl font-bold mb-3">Market News & Signals</h2>
        {newsItems.map((news, index) => (
          <NewsCard
            key={index}
            title={news.title}
            source={news.source}
            text={news.text}
            stocks={news.stocks}
            className={index < newsItems.length - 1 ? 'mb-4 pb-4 border-b' : ''}
          />
        ))}
      </CardContent>
    </Card>
  )
}

