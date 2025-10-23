"use client"
import React, { useState } from "react";
import { PortfolioChart, PortfolioHistoryPoint } from "@/components/enviro-compoents-real/Portfolio";
import { PortfolioSummary } from "@/components/enviro-compoents-real/PortfolioSummary";
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";
import MarketTips from "@/components/enviro-compoents-real/market-tips";
import { InfiniteCarousel } from '@/components/enviro-compoents-real/deeksha-carosel'
import { TransactionHistory} from "@/components/enviro-compoents-real/sandbox-transaction";
import { Transaction } from "@/components/enviro-components-real/sandbox-transaction";

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-10-22 14:30',
    symbol: 'AAPL',
    action: 'Buy' as const,    // <-- Use 'as const' here
    quantity: 10,
    price: 150.25,
    total: 1502.50,
  },
  {
    id: '2',
    date: '2025-10-23 10:15',
    symbol: 'TSLA',
    action: 'Sell' as const,   // <-- And here
    quantity: 5,
    price: 700.00,
    total: 3500.00,
  },
  // more transactions
]

function MyPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const myItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  return (
    <InfiniteCarousel
      items={myItems}
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
      renderCard={(item, index, isCurrent) => (
        <div className="w-full h-full rounded-lg bg-white shadow-sm p-6 border border-gray-200">
          <h3>{item.title}</h3>
          <p>Current: {isCurrent ? 'Yes' : 'No'}</p>
        </div>
      )}
    />
  )
}

const mockData: PortfolioHistoryPoint[] = [
  { timestamp: new Date('2024-09-01T12:00:00'), value: 2000 },
  { timestamp: new Date('2025-09-01'), value: 9500 },
  { timestamp: new Date('2025-09-05'), value: 9700 },
  { timestamp: new Date('2025-09-10'), value: 9900 },
  { timestamp: new Date('2025-09-15'), value: 10100 },
  { timestamp: new Date('2025-09-20'), value: 10250 },
  { timestamp: new Date('2025-09-25'), value: 10400 },
  { timestamp: new Date('2025-09-30'), value: 10600 },
  { timestamp: new Date('2025-10-01'), value: 10500 },
  { timestamp: new Date('2025-10-05'), value: 10700 },
  { timestamp: new Date('2025-10-08'), value: 2000 },
  { timestamp: new Date('2025-10-09'), value: 10850 },
];

// You can compute these from mockData or hardcode for now
const totalValue = 10850;
const cashBalance = 3000;
const totalGainLoss = totalValue - mockData[0].value;
const totalGainLossPercent = (totalGainLoss / mockData[0].value) * 100;

export default function PortfolioDashboardPage() {

    const transactions = sampleTransactions

  return (
    <div>
      <Navbar/>
      <StockTicker />
      <main className=" p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>

        {/* Container taking 50% width, aligned to right */}
        <div className="flex w-full gap-6">
          <div className="w-1/2">
            <MyPage />
          </div>
          <div className="w-1/2 ml-auto flex flex-col items-center">
          
              <PortfolioChart portfolioHistory={mockData} />

            {/* Summary below the chart, centered */}
            <div className="max-w-[1000px] mt-8 w-full">
              <PortfolioSummary
                totalValue={totalValue}
                cashBalance={cashBalance}
                totalGainLoss={totalGainLoss}
                totalGainLossPercent={totalGainLossPercent}
              />
            </div>
          </div>
        </div>

      <div className="pt-6">
        <MarketTips/>
      </div>

      <div className="pt-6">
        <TransactionHistory transactions={transactions} />
      </div>
      </main>
    </div>
  );
}

// EXAMPLE USAGE:
/*
import { InfiniteCarousel } from './InfiniteCarousel'

function MyPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const myItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  return (
    <InfiniteCarousel
      items={myItems}
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
      renderCard={(item, index, isCurrent) => (
        <div className="w-full h-full rounded-lg bg-white shadow-sm p-6 border border-gray-200">
          <h3>{item.title}</h3>
          <p>Current: {isCurrent ? 'Yes' : 'No'}</p>
        </div>
      )}
    />
  )
}
*/