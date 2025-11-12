"use client";
import React from 'react';
import Navbar from '../../../components/Navbar';
import StockTicker from '../../../components/StockTicker';
import ModNav from '../components/ModNav';
import Quiz from '../components/Quiz';
import { getQuestions } from '../data/moduleQuestions';

const Module3: React.FC = () => {
  const qs = getQuestions(3);
  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />
  <StockTicker />
      <ModNav moduleIndex={3} totalModules={10} title="Buying vs Selling" />
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2 text-black">Module 3 — Buying vs Selling</h1>
          <p className="text-black">Placeholder content for module 3.</p>
        </div>

        <div className="flex justify-center mt-6">
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-black">Module Quiz</h3>
              <Quiz moduleIndex={3} questions={qs} />
            </div>
          </div>
        </div>

        {/* Prev/Home/Next below quiz */}
        <div className="flex justify-center mt-4">
          <div className="w-full max-w-3xl grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <a href="/lessonmodules/2" className="px-4 py-2 bg-gray-700 text-white rounded">Previous Module</a>
            </div>

            <div className="flex justify-center">
              <a href="/learn" aria-label="Home" className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M3 9.5L12 3l9 6.5"/><path d="M9 22V12h6v10"/></svg>
              </a>
            </div>

            <div className="flex justify-end">
              <a href="/lessonmodules/4" className="px-4 py-2 bg-gray-700 text-white rounded">Next Module</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Module3;
