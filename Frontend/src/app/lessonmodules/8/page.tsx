"use client";
import React from 'react';
import Navbar from '../../../components/Navbar';
import StockTicker from '../../../components/StockTicker';
import ModNav from '../components/ModNav';
import Quiz from '../components/Quiz';
import { getQuestions } from '../data/moduleQuestions';

const Module8: React.FC = () => {
  const qs = getQuestions(8);
  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />
  <StockTicker />
      <ModNav moduleIndex={8} totalModules={10} title="Reading a graph" />
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2 text-black">Module 8 — Reading a graph</h1>
          <p className="text-black">Placeholder content for module 8.</p>
        </div>

        <div className="flex justify-center mt-6">
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-black">Module Quiz</h3>
              <Quiz moduleIndex={8} questions={qs} />
            </div>
          </div>
        </div>

        {/* Prev/Next below quiz */}
        <div className="flex justify-center mt-4">
          <div className="w-full max-w-3xl flex justify-between">
            <a href="/lessonmodules/7" className="px-4 py-2 bg-gray-700 text-white rounded">Previous Module</a>
            <a href="/lessonmodules/9" className="px-4 py-2 bg-gray-700 text-white rounded">Next Module</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Module8;
