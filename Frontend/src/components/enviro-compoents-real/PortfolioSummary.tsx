import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  cashBalance: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export function PortfolioSummary({
  totalValue,
  cashBalance,
  totalGainLoss,
  totalGainLossPercent,
}: PortfolioSummaryProps) {
  const isPositive = totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-muted-foreground">Total Value</h3>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-muted-foreground">Cash Balance</h3>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl">
          ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-muted-foreground">Total Gain/Loss</h3>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className={`text-2xl ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}
          ${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-muted-foreground">Return</h3>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className={`text-2xl ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}
          {totalGainLossPercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
