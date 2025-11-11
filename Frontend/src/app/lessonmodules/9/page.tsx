"use client";
import React from 'react';
import ModNav from '../components/ModNav';
import Quiz from '../components/Quiz';
import { getQuestions } from '../data/moduleQuestions';
import content from './content';

const Module9: React.FC = () => {
  const qs = getQuestions(9);
  return (
    <div className="min-h-screen bg-gray-50">
      <ModNav moduleIndex={9} totalModules={10} title="Sustainability Factors" />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: content.layout?.format?.headerFont, color: content.layout?.format?.headerColor }}>{content.title}</h1>
              <p style={{ fontFamily: content.layout?.format?.bodyFont }} className="text-gray-800 text-lg mb-4">{content.intro}</p>
              <p style={{ fontFamily: content.layout?.format?.bodyFont }} className="text-gray-700 text-lg italic mb-6">{content.purpose}</p>
            </header>

            <div className="bg-emerald-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: content.layout?.format?.headerFont, color: content.layout?.format?.headerColor }}>What you will learn</h2>
              <ul className="space-y-2" style={{ fontFamily: content.layout?.format?.bodyFont }}>
                {content.learnList.map((it: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-emerald-600 mr-2">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>

            {content.sections.map((s: any, idx: number) => (
              <section key={idx} className="mb-8">
                <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: content.layout?.format?.headerFont, color: content.layout?.format?.headerColor }}>{s.heading}</h3>
                <div style={{ fontFamily: content.layout?.format?.bodyFont }} className="text-gray-800 leading-relaxed space-y-4">
                  {s.body.split('\n').map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: content.layout?.format?.headerFont, color: content.layout?.format?.headerColor }}>Key points</h3>
              <ul className="space-y-2" style={{ fontFamily: content.layout?.format?.bodyFont }}>
                {content.keyPoints.map((kp: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-emerald-600 mr-2">•</span>
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <section className="mt-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-6" style={{ fontFamily: content.layout?.format?.headerFont, color: content.layout?.format?.headerColor }}>Module Quiz</h3>
            <div style={{ fontFamily: content.layout?.format?.bodyFont }}>
              <Quiz moduleIndex={9} questions={qs} />
            </div>
          </div>
        </section>

        {/* Prev/Next below quiz */}
        <div className="flex justify-center mt-4">
          <div className="w-full max-w-3xl flex justify-between">
            <a href="/lessonmodules/8" className="px-4 py-2 bg-gray-700 text-white rounded">Previous Module</a>
            <a href="/lessonmodules/10" className="px-4 py-2 bg-gray-700 text-white rounded">Next Module</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Module9;
