import React from "react";
import Navbar from "@/components/Navbar";
import StockTicker from "@/components/StockTicker";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* real stock ticker component */}
      <StockTicker />

      <main className="max-w-6xl mx-auto p-6">
        <section className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Placeholder hero title</h1>
          <p className="text-gray-600">
            This is a short introduction to the Learn modules. Two to three
            lines of subtext go here to describe the learning path and what to
            expect.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow divide-y">
              {moduleTitles.map((title, i) => {
                const moduleNumber = i + 1; // 1-based
                const label =
                  moduleNumber === moduleTitles.length
                    ? "X"
                    : String(moduleNumber);
                return (
                  <Link
                    key={i}
                    href={`/lessonmodules/${moduleNumber}`}
                    className="block p-6 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-gray-500">
                        Module {label}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {title}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">Open →</div>
                  </Link>
                );
              })}
            </div>
          </div>

          <aside className="lg:col-span-3 flex flex-col items-center">
            <div className="w-full bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Progress
              </h3>
              <div className="flex flex-col items-center gap-4">
                {moduleTitles.map((_, i) => {
                  const moduleNumber = i + 1;
                  const label =
                    moduleNumber === moduleTitles.length
                      ? "X"
                      : String(moduleNumber);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 w-full justify-between"
                    >
                      <div className="text-sm text-gray-600">
                        Module {label}
                      </div>
                      <div className="w-12 h-12">
                        <ProgressRing
                          percent={progress[i] ?? getProgress(moduleNumber, 4)}
                          size={44}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
