"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress } from '../lessonmodules/data/userProgress';
import ProgressRing from '../lessonmodules/components/ProgressRing';

// List of module titles in learning order. The demo lives at the final position (rendered as Module X).
const moduleTitles: string[] = [
  'Introduction to FundThesis',
  'What is a Stock and ETF',
  'Buying vs Selling',
  'Portfolio Basics',
  'Market Movement & Risk',
  'Company Research',
  'Long-Term vs Short-Term Horizons',
  'Reading a Graph',
  'Sustainability Factors',
  'Demo'
];

const CircularRing: React.FC<{ percent: number; size?: number }> = ({ percent, size = 40 }) => {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        stroke="#3b82f6"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
    </svg>
  );
};

const LearnPage: React.FC = () => {
  const [progress, setProgress] = useState<number[]>(() => Array(moduleTitles.length).fill(0));

  useEffect(() => {
    // Load saved progress via the central helper (module indices are 1-based in storage).
    const load = () => {
      try {
        const p = moduleTitles.map((_, i) => getProgress(i + 1, 4));
        setProgress(p);
      } catch (e) {
        // ignore (safety for environments without localStorage)
      }
    };

    load();

    // Listen for our custom event (dispatched after writes) and storage events
    // so progress updates in other components/tabs are reflected immediately.
    const onChange = () => load();
    window.addEventListener('ft-progress-changed', onChange);
    window.addEventListener('storage', onChange);

    return () => {
      window.removeEventListener('ft-progress-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto p-6">
        <section className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Placeholder hero title</h1>
          <p className="text-gray-600">This is a short introduction to the Learn modules. Two to three lines of subtext go here to describe the learning path and what to expect.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow divide-y">
              {moduleTitles.map((title, i) => {
                const moduleNumber = i + 1; // 1-based
                const label = moduleNumber === moduleTitles.length ? 'X' : String(moduleNumber);
                return (
                  <Link key={i} href={`/lessonmodules/${moduleNumber}`} className="block p-6 hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Module {label}</div>
                      <div className="text-lg font-semibold text-gray-900">{title}</div>
                    </div>
                    <div className="text-sm text-gray-500">Open →</div>
                  </Link>
                );
              })}
            </div>
          </div>

          <aside className="lg:col-span-3 flex flex-col items-center">
            <div className="w-full bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Progress</h3>
              <div className="flex flex-col items-center gap-4">
                {moduleTitles.map((_, i) => {
                  const moduleNumber = i + 1;
                  const label = moduleNumber === moduleTitles.length ? 'X' : String(moduleNumber);
                  return (
                    <div key={i} className="flex items-center gap-4 w-full justify-between">
                      <div className="text-sm text-gray-600">Module {label}</div>
                      <div className="w-12 h-12">
                        <ProgressRing percent={progress[i] ?? getProgress(moduleNumber, 4)} size={44} />
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
};

export default LearnPage;