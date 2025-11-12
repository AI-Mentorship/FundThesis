"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { StockModel, TradeResult } from '../lib/stockModel';
import Navbar from '../../../components/Navbar';
import ModNav from '../components/ModNav';
import StockTicker from '../../../components/StockTicker';
import questionsByModule, { getQuestions } from '../data/moduleQuestions';
import Confetti from '../../../components/Confetti';
// DecisionQuiz is defined in this file for the Module X assessment
type Decision = 'BUY' | 'SELL' | 'HOLD' | null;

const DecisionQuiz: React.FC = () => {
  const scenarios = [
    { id: 's1', title: 'AI chip demand surges', text: 'Analysts report stronger-than-expected demand for GPUs in data centers, which may boost NVDA revenue this quarter.', correct: 'BUY' as Decision, explanation: 'Increased demand for GPUs is a positive signal for NVDA revenue and growth.' },
    { id: 's2', title: 'Fed signals on interest rates', text: 'Recent commentary suggests rates could remain elevated, potentially weighing on growth stocks by increasing discount rates.', correct: 'HOLD' as Decision, explanation: 'Higher rates can pressure growth valuations; a cautious approach (hold) may be appropriate.' },
    { id: 's3', title: 'Supply chain tariffication risk', text: 'New tariffs proposed on semiconductor components could raise costs for manufacturers and squeeze margins.', correct: 'SELL' as Decision, explanation: 'Tariffs that increase costs can hurt margins and are a near-term negative for suppliers.' },
    { id: 's4', title: 'Partnership announcement', text: 'NVDA announces a strategic partnership with a major cloud provider to integrate its AI stack, expanding reach.', correct: 'BUY' as Decision, explanation: 'Strategic partnerships can expand revenue opportunities and distribution.' }
  ];

  const [answers, setAnswers] = React.useState<Record<string, Decision>>({});
  const [submitted, setSubmitted] = React.useState(false);

  function select(id: string, choice: Decision) {
    setAnswers(a => ({ ...a, [id]: choice }));
  }

  function score() {
    let correct = 0;
    scenarios.forEach(s => { if (answers[s.id] === s.correct) correct++; });
    return { correct, total: scenarios.length };
  }

  const result = submitted ? score() : null;

  return (
    <div className="space-y-4">
      {scenarios.map(s => (
        <div key={s.id} className="p-3 border rounded">
          <div className="font-semibold">{s.title}</div>
          <div className="text-sm text-gray-700 mb-2">{s.text}</div>
          <div className="flex gap-3">
            {(['BUY','SELL','HOLD'] as Decision[]).map(opt => (
              <button
                key={opt || 'null'}
                onClick={() => select(s.id, opt)}
                className={`px-3 py-1 rounded ${answers[s.id] === opt ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {opt}
              </button>
            ))}
          </div>
          {submitted && (
            <div className="mt-2 text-sm">
              <div><strong>Correct:</strong> {s.correct}</div>
              <div className="text-gray-600">{s.explanation}</div>
              <div className="mt-1">Your answer: <span className="font-semibold">{answers[s.id] ?? '—'}</span></div>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button onClick={() => setSubmitted(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Check Answers</button>
        <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
        {submitted && result && (
          <div className="ml-auto font-semibold">Score: {result.correct} / {result.total}</div>
        )}
      </div>
    </div>
  );
};

const Module10: React.FC = () => {
  const stock = useMemo(() => new StockModel(875.4), []);
  const [, tick] = useState(0);

  useEffect(() => {
    const unsub = stock.subscribe(() => tick(s => s + 1));
    const iv = setInterval(() => stock.tick(), 3000);
    return () => { unsub(); clearInterval(iv); };
  }, [stock]);

  const [balance, setBalance] = useState<number>(10000);
  const [shares, setShares] = useState<number>(0);
  const [amount, setAmount] = useState<number>(1);
  const [orderType, setOrderType] = useState<'market'|'limit'|'stop'>('market');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [history, setHistory] = useState<TradeResult[]>([]);

  // Assessment mode intercepts buy/sell clicks and uses them as answers to scenarios
  const [assessmentActive] = useState<boolean>(true);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // displayedPrice is the price shown to the user; it stays constant during each scenario
  const randPrice = () => Math.round((150 + Math.random() * 100) * 100) / 100;
  const [displayedPrice, setDisplayedPrice] = useState<number>(() => randPrice());

  const doBuy = () => {
    // If assessment is active and current scenario unanswered, treat this click as the answer
    if (assessmentActive && decisionState.currentIndex < decisionState.scenarios.length && !decisionState.answeredIds.has(decisionState.scenarios[decisionState.currentIndex].id)) {
      handleAssessmentAnswer('BUY');
      return;
    }

    const limit = parseFloat(limitPrice);
    const res = stock.executeTrade('BUY', amount, orderType, Number.isFinite(limit) ? limit : undefined);
    if (balance < res.total) { alert('Insufficient funds'); return; }
    setBalance(b => b - res.total);
    setShares(s => s + res.shares);
    setHistory(h => [...h, res]);
  };

  const doSell = () => {
    if (assessmentActive && decisionState.currentIndex < decisionState.scenarios.length && !decisionState.answeredIds.has(decisionState.scenarios[decisionState.currentIndex].id)) {
      handleAssessmentAnswer('SELL');
      return;
    }

    if (shares < amount) { alert('Insufficient shares'); return; }
    const limit = parseFloat(limitPrice);
    const res = stock.executeTrade('SELL', amount, orderType, Number.isFinite(limit) ? limit : undefined);
    setBalance(b => b + res.total);
    setShares(s => s - res.shares);
    setHistory(h => [...h, res]);
  };

  // --- Decision assessment state and handlers ---
  type Decision = 'BUY' | 'SELL';

  const initialScenarios = [
    { id: 's1', title: 'AI chip demand surges', text: 'Analysts report stronger-than-expected demand for GPUs in data centers, which may boost NVDA revenue this quarter.', correct: 'BUY' as Decision, explanation: 'Increased demand for GPUs is a positive signal for NVDA revenue and growth.', recommendedOrder: 'market' },
    { id: 's2', title: 'Fed signals on interest rates', text: 'Recent commentary suggests rates could remain elevated, potentially weighing on growth stocks by increasing discount rates.', correct: 'SELL' as Decision, explanation: 'Higher rates can pressure growth valuations; cautious positioning or selling may be justified.', recommendedOrder: 'limit' },
    { id: 's3', title: 'Supply chain tariffication risk', text: 'New tariffs proposed on semiconductor components could raise costs for manufacturers and squeeze margins.', correct: 'SELL' as Decision, explanation: 'Tariffs that increase costs can hurt margins and are a near-term negative for suppliers.', recommendedOrder: 'stop' },
    { id: 's4', title: 'Partnership announcement', text: 'NVDA announces a strategic partnership with a major cloud provider to integrate its AI stack, expanding reach.', correct: 'BUY' as Decision, explanation: 'Strategic partnerships can expand revenue opportunities and distribution.', recommendedOrder: 'limit' }
  ];

  const [decisionState, setDecisionState] = useState(() => ({
    scenarios: initialScenarios,
    currentIndex: 0,
    answers: {} as Record<string, { choice: Decision; correct: boolean; feedback: string; recommendedOrder?: string }> ,
    answeredIds: new Set<string>()
  }));

  function handleAssessmentAnswer(choice: Decision) {
    const s = decisionState.scenarios[decisionState.currentIndex];
    const isCorrect = choice === s.correct;
    const feedback = `${isCorrect ? 'Correct.' : 'Not quite.'} ${s.explanation}`;
    setDecisionState(ds => {
      const answers = { ...ds.answers, [s.id]: { choice, correct: isCorrect, feedback, recommendedOrder: s.recommendedOrder } };
      const answeredIds = new Set(ds.answeredIds);
      answeredIds.add(s.id);
      return { ...ds, answers, answeredIds };
    });
    // show confetti briefly on correct answers
    if (isCorrect) {
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 1600);
    }
    // change displayed price after user submits decision
    setDisplayedPrice(randPrice());
  }

  function nextScenario() {
    setDecisionState(ds => ({ ...ds, currentIndex: Math.min(ds.currentIndex + 1, ds.scenarios.length) }));
  }

  function resetAssessment() {
    setDecisionState({ scenarios: initialScenarios, currentIndex: 0, answers: {}, answeredIds: new Set<string>() });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* real stock ticker (demo moved to Module 10) */}
      <StockTicker />

      <ModNav moduleIndex={10} totalModules={10} title="Demo" />

      <main className="max-w-6xl mx-auto p-6">
        <p className="max-w-3xl mx-auto text-gray-700 mb-6">This demo module combines live-like NVDA pricing and a short simulated news feed. Read the news snippets and use the trading tools to practice making buy, sell, or hold decisions — then try the short decision assessment below to see how those choices align with market signals.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                  <div className="text-3xl font-bold text-black">NVDA</div>
                <div className="text-sm text-black">NVIDIA Corporation</div>
              </div>
              <div className="text-right">
                  <div className="text-3xl font-bold text-black">${displayedPrice.toFixed(2)}</div>
              </div>
            </div>

            <div className="w-full bg-gray-50 p-4 rounded mb-4 text-black">
              <label className="block text-sm font-semibold mb-1 text-black">Order Type</label>
              <select value={orderType} onChange={(e) => setOrderType(e.target.value as 'market' | 'limit' | 'stop')} className="w-full mb-3 p-2 border rounded">
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop">Stop</option>
              </select>

              <label className="block text-sm font-semibold mb-1 text-black">Shares</label>
              <input type="number" min={1} value={amount} onChange={e => setAmount(parseInt(e.target.value || '1'))} className="w-full mb-3 p-2 border rounded" />

              {(orderType === 'limit' || orderType === 'stop') && (
                <>
                  <label className="block text-sm font-semibold mb-1 text-black">Price</label>
                  <input type="number" step="0.01" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} className="w-full mb-3 p-2 border rounded" />
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={doBuy} className="px-4 py-2 bg-green-600 text-white rounded">Buy</button>
                <button onClick={doSell} className="px-4 py-2 bg-red-600 text-white rounded">Sell</button>
              </div>
            </div>

            <div className="bg-white">
              <h4 className="text-sm font-semibold mb-2 text-black">Trading History</h4>
              <ul className="space-y-2 text-sm text-black">
                {history.slice().reverse().map((t, i) => (
                  <li key={i} className="flex justify-between">
                    <div className="text-black"><span className={`font-semibold ${t.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>{t.type}</span> {t.shares} @ ${t.price.toFixed(2)}</div>
                    <div className="text-black">{t.time}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold mb-3 text-black">Market News</h4>
            <div className="space-y-4 text-sm text-black">
              {/* show only the current scenario here */}
              {decisionState.scenarios[decisionState.currentIndex] ? (
                <article className="border-l-4 border-gray-200 pl-3">
                  <div className="text-2xl font-bold text-black mb-2">{decisionState.scenarios[decisionState.currentIndex].title}</div>
                  <div className="text-gray-700">{decisionState.scenarios[decisionState.currentIndex].text}</div>
                </article>
              ) : (
                <div className="text-gray-700">All scenarios completed. Use retry to practice again.</div>
              )}
            </div>
          </aside>
        </div>

        {/* Module decision assessment (interactive using Buy/Sell clicks) */}
        <div className="flex justify-center mt-6">
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-black">Decision Assessment</h3>

              {/* feedback area & controls */}
              <div className="space-y-4">
                <Confetti active={confettiActive} />
                {decisionState.scenarios[decisionState.currentIndex] ? (
                  <div>
                    <div className="text-sm text-gray-700 mb-2">Read the news on the right, then use the trading panel to choose Buy or Sell for this scenario.</div>
                    <div className="mt-2">
                              {decisionState.answeredIds.has(decisionState.scenarios[decisionState.currentIndex].id) ? (
                                (() => {
                                  const sid = decisionState.scenarios[decisionState.currentIndex].id;
                                  const ans = decisionState.answers[sid];
                                  return (
                                    <div className={`p-3 border rounded ${ans.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                      <div className={`font-semibold ${ans.correct ? 'text-green-700' : 'text-red-700'}`}>{ans.correct ? 'Correct' : 'Not quite'}</div>
                                      <div className="text-sm text-gray-700 mt-1">{ans.feedback}</div>
                                      <div className="text-sm text-gray-600 mt-2">Recommended Order Type: <span className="font-semibold">{ans.recommendedOrder}</span></div>
                                      <div className="mt-3 flex">
                                        <button onClick={nextScenario} className="px-3 py-1 bg-blue-600 text-white rounded">Next</button>
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                        <div className="p-3 border rounded bg-gray-50">
                          <div className="text-sm text-gray-700">Awaiting your Buy or Sell choice from the trading panel.</div>
                        </div>
                      )}
                    </div>
                  </div>
                  ) : (
                  <div className="text-center">
                    <div className="font-semibold mb-2">All scenarios completed</div>
                    <div className="text-sm text-gray-700 mb-4">You can retry the set to practice again.</div>
                    <button onClick={resetAssessment} aria-label="Retry" className="w-10 h-10 rounded-full bg-gray-700 text-white inline-flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
        {/* Prev/Exit below quiz */}
        <div className="flex justify-center mt-4">
          <div className="w-full max-w-3xl flex justify-between">
            <a href="/lessonmodules/9" className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50">Previous Module</a>
            <a href="/learn" className="px-4 py-2 bg-gray-700 text-white rounded">Exit</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Module10;
