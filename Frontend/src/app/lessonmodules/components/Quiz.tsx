"use client";
import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import Confetti from './Confetti';
import { markQuestionAnswered } from '../data/userProgress';
import { saveResult } from '@/lib/dummyProgressDB';
import { Question } from './types';
import { getStartingQuestionIndex, canNavigateToQuestion, isQuestionAnswered } from '../data/quizNavigation';

type Props = {
  moduleIndex: number;
  questions: Question[];
};

const Quiz: React.FC<Props> = ({ moduleIndex, questions }) => {
  const [current, setCurrent] = useState(() => getStartingQuestionIndex(moduleIndex, questions));
  const [showResult, setShowResult] = useState<{ correct: boolean; explanation?: string; selectedIndex?: number } | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);

  // Update current question when moduleIndex or questions change
  useEffect(() => {
    setCurrent(getStartingQuestionIndex(moduleIndex, questions));
  }, [moduleIndex, questions]);

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
    // determine the furthest index user can move forward to (first unanswered)
    let firstUnanswered = questions.length - 1;
    for (let i = 0; i < questions.length; i++) {
      if (!isQuestionAnswered(moduleIndex, questions[i].id)) {
        firstUnanswered = i;
        break;
      }
    }
    const allowedMax = Math.min(firstUnanswered, questions.length - 1);
    setCurrent(c => (c < allowedMax ? c + 1 : c));
  };

  const previous = () => {
    setShowResult(null);
    if (current > 0 && canNavigateToQuestion(moduleIndex, questions, current - 1)) {
      setCurrent(c => c - 1);
    }
  };

  const canGoBack = current > 0 && canNavigateToQuestion(moduleIndex, questions, current - 1);
  // compute forward availability up to the first unanswered question
  let firstUnanswered = questions.length - 1;
  for (let i = 0; i < questions.length; i++) {
    if (!isQuestionAnswered(moduleIndex, questions[i].id)) { firstUnanswered = i; break; }
  }
  const allowedMax = Math.min(firstUnanswered, questions.length - 1);
  const canGoNext = current < allowedMax;

  return (
    <div className="w-full">
      {confettiOn && <Confetti />}
      <div className="grid grid-cols-1 gap-4">
  <QuestionCard question={questions[current]} onAnswer={onAnswer} showResult={showResult} locked={!!(showResult && showResult.correct)} />
        <div className="grid grid-cols-3 items-center">
          <div className="justify-self-start flex items-center gap-3">
            {canGoBack && (
              <button 
                onClick={previous} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          <div className="justify-self-center text-sm text-gray-600">
            {current + 1} / {questions.length}
          </div>
          <div className="justify-self-end">
            <button
              onClick={next}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canGoNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
