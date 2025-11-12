"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortfolioTable } from "@/components/ui/PortfolioTable";

interface PortfolioStock {
  id: string;
  symbol: string;
  company: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
}

export default function PortfolioPage() {
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>([
    {
      id: "1",
      symbol: "AAPL",
      company: "Apple Inc.",
      shares: 50,
      avgCost: 150.0,
      currentPrice: 178.5,
      totalValue: 8925.0,
      totalCost: 7500.0,
      gainLoss: 1425.0,
      gainLossPercent: 19.0,
    },
    {
      id: "2",
      symbol: "MSFT",
      company: "Microsoft Corp.",
      shares: 25,
      avgCost: 380.0,
      currentPrice: 420.15,
      totalValue: 10503.75,
      totalCost: 9500.0,
      gainLoss: 1003.75,
      gainLossPercent: 10.57,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState<PortfolioStock | null>(null);
  const [formData, setFormData] = useState({
    symbol: "",
    company: "",
    shares: "",
    avgCost: "",
  });

  const totalPortfolioValue = portfolioStocks.reduce(
    (sum, stock) => sum + stock.totalValue,
    0
  );
  const totalPortfolioCost = portfolioStocks.reduce(
    (sum, stock) => sum + stock.totalCost,
    0
  );
  const totalGainLoss = totalPortfolioValue - totalPortfolioCost;
  const totalGainLossPercent = (totalGainLoss / totalPortfolioCost) * 100;

  const handleAddStock = () => {
    const shares = parseFloat(formData.shares);
    const avgCost = parseFloat(formData.avgCost);
    const currentPrice = avgCost * 1.1; // Mock current price
    const totalCost = shares * avgCost;
    const totalValue = shares * currentPrice;
    const gainLoss = totalValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;

    const newStock: PortfolioStock = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      company: formData.company,
      shares,
      avgCost,
      currentPrice,
      totalValue,
      totalCost,
      gainLoss,
      gainLossPercent,
    };

    setPortfolioStocks([...portfolioStocks, newStock]);
    setShowAddModal(false);
    setFormData({ symbol: "", company: "", shares: "", avgCost: "" });
  };

  const handleEditStock = () => {
    if (!editingStock) return;

    const shares = parseFloat(formData.shares);
    const avgCost = parseFloat(formData.avgCost);
    const totalCost = shares * avgCost;
    const totalValue = shares * editingStock.currentPrice;
    const gainLoss = totalValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;

    setPortfolioStocks(
      portfolioStocks.map((stock) =>
        stock.id === editingStock.id
          ? {
              ...stock,
              shares,
              avgCost,
              totalCost,
              totalValue,
              gainLoss,
              gainLossPercent,
            }
          : stock
      )
    );
    setEditingStock(null);
    setFormData({ symbol: "", company: "", shares: "", avgCost: "" });
  };

  const handleDeleteStock = (id: string) => {
    setPortfolioStocks(portfolioStocks.filter((stock) => stock.id !== id));
  };

  const openEditModal = (stock: PortfolioStock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      company: stock.company,
      shares: stock.shares.toString(),
      avgCost: stock.avgCost.toString(),
    });
  };

  // Transform portfolioStocks to holdings format for PortfolioTable
  const holdings = portfolioStocks.map((stock) => ({
    symbol: stock.symbol,
    shares: stock.shares,
    price: `$${stock.currentPrice.toFixed(2)}`,
    value: `$${stock.totalValue.toFixed(2)}`,
    gainLoss: `${stock.gainLoss >= 0 ? "+" : ""}$${stock.gainLoss.toFixed(
      2
    )} (${stock.gainLossPercent >= 0 ? "+" : ""}${stock.gainLossPercent.toFixed(
      2
    )}%)`,
    isPositive: stock.gainLoss >= 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="Portfolio"
          description="Manage and optimize your investment portfolio"
        />

        <PortfolioTable holdings={holdings} />
      </main>
    </div>
  );
}
