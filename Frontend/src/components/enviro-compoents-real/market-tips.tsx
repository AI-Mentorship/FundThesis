"use client"

import { useEffect, useState } from "react"
import { Lightbulb } from "lucide-react"

type MarketTip = {
  category: string
  tip: string
}

const marketTips: MarketTip[] = [
  {
    category: "Strategy",
    tip: "Diversification is key to managing risk. Don't put all your eggs in one basket - spread investments across different sectors and asset classes.",
  },
  {
    category: "Analysis",
    tip: "Tech stocks showing strong momentum this quarter. AI and cloud computing sectors leading with 15% average gains.",
  },
  {
    category: "Risk Management",
    tip: "Set stop-loss orders to protect your portfolio from significant downturns. A common strategy is 7-8% below purchase price.",
  },
  {
    category: "Market Trend",
    tip: "Federal Reserve signals potential rate cuts in Q2 2025. This typically benefits growth stocks and tech sector.",
  },
  {
    category: "Tip",
    tip: "Dollar-cost averaging helps reduce the impact of volatility. Invest fixed amounts regularly rather than timing the market.",
  },
  {
    category: "Opportunity",
    tip: "Energy sector showing recovery signs with oil prices stabilizing. Consider adding exposure to diversified energy ETFs.",
  },
  {
    category: "Warning",
    tip: "High P/E ratios in certain tech stocks suggest overvaluation. Research fundamentals before chasing momentum.",
  },
  {
    category: "Strategy",
    tip: "Rebalance your portfolio quarterly to maintain target asset allocation and lock in gains from outperforming sectors.",
  },
]

export default function MarketTips() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % marketTips.length)
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  const currentTip = marketTips[currentTipIndex]

  return (
    <div className="rounded-xl border border-border border-l-4 border-l-accent bg-card shadow-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-accent/10 p-2">
            <Lightbulb className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                {currentTip.category}
              </span>
              <span className="text-xs text-muted-foreground">Market Tip</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground">{currentTip.tip}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
