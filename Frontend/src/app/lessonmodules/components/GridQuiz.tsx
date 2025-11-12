"use client";
import React, { useState, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import Confetti from './Confetti';
import { markQuestionAnswered } from '../data/userProgress';
import { saveResult } from '@/lib/dummyProgressDB';
import { Question } from './types';

type Props = {
  moduleIndex: number;
  questions: Question[];
};

const GridQuiz: React.FC<Props> = ({ moduleIndex, questions }) => {
  // per-question result state: null | { correct, explanation? }
  const [results, setResults] = useState<Array<{ correct: boolean; explanation?: string; selectedIndex?: number } | null>>(
    () => questions.map(() => null)
  );
  const [confettiOn, setConfettiOn] = useState(false);

  const handleAnswer = useCallback((qIndex: number, choiceIndex: number) => {
    const q = questions[qIndex];
    const already = results[qIndex];
    // if already correct, ignore further answers
    if (already && already.correct) return;

    const correct = choiceIndex === q.correctIndex;
  const explanation = q.explanations?.[choiceIndex];

    // persist correctness to dummy DB
    try { saveResult(moduleIndex, q.id, correct); } catch (e) { /* ignore */ }

    setResults(prev => {
      const next = prev.slice();
      next[qIndex] = { correct, explanation, selectedIndex: choiceIndex };
      return next;
    });

    if (correct) {
      // mark progress (only once per question id)
      markQuestionAnswered(moduleIndex, q.id, questions.length);
      setConfettiOn(true);
      setTimeout(() => setConfettiOn(false), 1800);
    }
  }, [questions, results, moduleIndex]);

  return (
    <div className="w-full">
      {confettiOn && <Confetti />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            onAnswer={(choiceIndex) => handleAnswer(i, choiceIndex)}
            showResult={results[i] ?? null}
            // lock the card only when the answer is correct so users can retry when wrong
            locked={Boolean(results[i] && results[i]?.correct)}
          />
        ))}
      </div>
    </div>
  );
};

export default GridQuiz;
