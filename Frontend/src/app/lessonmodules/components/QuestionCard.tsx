"use client";
import React from 'react';
import { Question } from './types';

type Props = {
  question: Question;
  onAnswer: (choiceIndex: number) => void;
  showResult: { correct: boolean; explanation?: string; selectedIndex?: number } | null;
  /** When true, the card will disable options as soon as any answer is shown. When false, only correct answers lock the card. Default: true (preserve current behavior). */
  locked?: boolean;
};

const QuestionCard: React.FC<Props> = ({ question, onAnswer, showResult, locked }) => {
  return (
    <div className="bg-white p-4 rounded shadow text-black">
      <div className="text-lg font-semibold mb-3 text-black">{question.question}</div>
      <div className="grid grid-cols-1 gap-2">
        {question.choices.map((c, i) => {
          const isLocked = Boolean(locked) || Boolean(showResult && showResult.correct === true);
          // highlight only when the user has answered correctly (reveal correct) or when the user selected this wrong option
          const isCorrectRevealed = !!showResult && showResult.correct === true && i === question.correctIndex;
          const isSelectedWrong = !!showResult && showResult.correct === false && showResult.selectedIndex === i;

          return (
            <button
              key={i}
              disabled={isLocked}
              onClick={() => onAnswer(i)}
              className={`w-full text-left px-3 py-2 border rounded ${isCorrectRevealed ? 'bg-green-50 border-green-200' : ''} ${isSelectedWrong ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center justify-between text-black">
                <div className="text-black">{c}</div>
                {isCorrectRevealed && <div className="text-green-600 font-semibold">Correct</div>}
                {isSelectedWrong && <div className="text-red-600 font-semibold">Not quite</div>}
              </div>
              {/* show explanation only for the selected wrong choice */}
              {showResult && showResult.correct === false && showResult.selectedIndex === i && question.explanations && (
                <div className="text-sm text-black mt-2">{question.explanations[i]}</div>
              )}
            </button>
          );
        })}
      </div>
      {showResult && showResult.correct && (
        <div className="mt-3 text-green-700 font-semibold">Nice — {showResult.explanation ?? 'Good job!'}</div>
      )}
      {showResult && !showResult.correct && (
        <div className="mt-3 text-red-700 font-semibold">Not quite — {showResult.explanation ?? 'Review explanation.'}</div>
      )}
    </div>
  );
};

export default QuestionCard;
