'use client'

import React, { useState, useEffect, useRef } from "react";

interface StockCard {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const stocks: StockCard[] = [
  { id: 1, symbol: "AAPL", name: "Apple Inc.", price: 174.56, change: 1.2 },
  { id: 2, symbol: "GOOGL", name: "Alphabet Inc.", price: 2750.88, change: -0.8 },
  { id: 3, symbol: "TSLA", name: "Tesla Inc.", price: 880.45, change: 2.5 },
  { id: 4, symbol: "AMZN", name: "Amazon.com", price: 3330.65, change: -1.4 },
  { id: 5, symbol: "MSFT", name: "Microsoft Corp.", price: 305.21, change: 0.3 },
];

const mod = (n: number, m: number) => ((n % m) + m) % m;

const CARD_WIDTH = 300;
const CARD_HEIGHT = 200;
const CARD_SPACING = 180;
const VISIBLE_RANGE = 2;

const RouletteStocks: React.FC = () => {
  const [centerIndex, setCenterIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const prev = () => setCenterIndex(mod(centerIndex - 1, stocks.length));
  const next = () => setCenterIndex(mod(centerIndex + 1, stocks.length));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [centerIndex]);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    isDragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || startX.current === null) return;

    const deltaX = e.clientX - startX.current;

    if (deltaX > 40) prev();
    else if (deltaX < -40) next();

    startX.current = null;
    isDragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    startX.current = null;
    isDragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-10">
      {/* Left Arrow */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl z-10 text-gray-600 hover:text-black"
      >
        ‹
      </button>

      {/* Carousel Viewport */}
      <div
        className="overflow-hidden relative h-[200px] mx-14"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
      >
        <div className="relative w-full h-full">
          {stocks.map((stock, i) => {
            let distance = i - centerIndex;
            if (distance > stocks.length / 2) distance -= stocks.length;
            if (distance < -stocks.length / 2) distance += stocks.length;

            if (Math.abs(distance) > VISIBLE_RANGE) return null;

            const blur = Math.abs(distance) * 2;
            const opacity = Math.max(0.25, 1 - Math.abs(distance) * 0.3);
            const scale = 1 - Math.abs(distance) * 0.15;
            const translateX = distance * CARD_SPACING;

            return (
              <div
                key={stock.id}
                className="absolute left-1/2 top-1/2 w-[300px] h-[200px] rounded-xl bg-white border shadow-md p-5 flex flex-col justify-center items-center transition-all duration-300"
                style={{
                  filter: `blur(${blur}px)`,
                  opacity,
                  transform: `translateX(${translateX}px) scale(${scale}) translate(-50%, -50%)`,
                  zIndex: VISIBLE_RANGE + 1 - Math.abs(distance),
                }}
              >
                <div className="text-lg font-semibold">{stock.symbol}</div>
                <div className="text-gray-500 text-sm">{stock.name}</div>
                <div className="mt-4 text-2xl font-bold">
                  ${stock.price.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    stock.change >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-0 top-1/2 -translate-y-1/2 text-3xl z-10 text-gray-600 hover:text-black"
      >
        ›
      </button>
    </div>
  );
};

export default RouletteStocks;
