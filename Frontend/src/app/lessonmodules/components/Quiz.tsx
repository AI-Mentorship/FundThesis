"use client";
import React, { useState } from 'react';
import QuestionCard from './QuestionCard';
import Confetti from './Confetti';
import { markQuestionAnswered } from '../data/userProgress';
import { saveResult } from '@/lib/dummyProgressDB';
import { Question } from './types';

type Props = {
  moduleIndex: number;
  questions: Question[];
};

const Quiz: React.FC<Props> = ({ moduleIndex, questions }) => {
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState<{ correct: boolean; explanation?: string; selectedIndex?: number } | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);

  const onAnswer = (choiceIndex: number) => {
    const q = questions[current];
    const correct = choiceIndex === q.correctIndex;
    const explanation = q.explanations?.[choiceIndex];
    setShowResult({ correct, explanation, selectedIndex: choiceIndex });
    // store correctness in a local dummy DB until backend/auth is available
    try { saveResult(moduleIndex, q.id, correct); } catch (e) { /* ignore */ }
    // mark this question answered ONLY if the user was correct
    if (correct) {
      markQuestionAnswered(moduleIndex, q.id, questions.length);
    }
    if (correct) {
      setConfettiOn(true);
      setTimeout(() => setConfettiOn(false), 2500);
    }
  };

  const next = () => {
    setShowResult(null);
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  return (
    <div className="w-full">
      {confettiOn && <Confetti />}
      <div className="grid grid-cols-1 gap-4">
  <QuestionCard question={questions[current]} onAnswer={onAnswer} showResult={showResult} locked={!!(showResult && showResult.correct)} />
        <div className="flex justify-between">
          <div className="text-sm text-gray-600">{current + 1} / {questions.length}</div>
          <div>
            {showResult && current < questions.length - 1 && (
              <button onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
