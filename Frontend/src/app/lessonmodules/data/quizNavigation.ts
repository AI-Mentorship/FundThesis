/**
 * Quiz navigation utilities for managing question progress and navigation
 */

import { Question } from '../components/types';

const STORAGE_KEY = 'ft_user_progress_v1';

/**
 * Get the list of answered question IDs for a module
 */
function getAnsweredQuestionIds(moduleIndex: number): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data[moduleIndex] ?? [];
  } catch (e) {
    return [];
  }
}

/**
 * Calculate the starting question index based on progress.
 * Returns the index of the first unanswered question, or 0 if none answered.
 * 
 * @param moduleIndex - The module number (1-based)
 * @param questions - Array of questions for the module
 * @returns The index (0-based) of the question to start on
 */
export function getStartingQuestionIndex(moduleIndex: number, questions: Question[]): number {
  const answeredIds = getAnsweredQuestionIds(moduleIndex);
  
  // Find the first unanswered question
  for (let i = 0; i < questions.length; i++) {
    if (!answeredIds.includes(questions[i].id)) {
      return i;
    }
  }
  
  // If all questions are answered, start at the beginning
  return 0;
}

/**
 * Check if a specific question has been answered correctly
 */
export function isQuestionAnswered(moduleIndex: number, questionId: string): boolean {
  const answeredIds = getAnsweredQuestionIds(moduleIndex);
  return answeredIds.includes(questionId);
}

/**
 * Check if the user can navigate to a specific question index
 * Users can navigate to:
 * - Any previously answered question (to review)
 * - The first unanswered question
 * 
 * @param moduleIndex - The module number (1-based)
 * @param questions - Array of questions for the module
 * @param targetIndex - The index the user wants to navigate to
 * @returns true if navigation is allowed
 */
export function canNavigateToQuestion(
  moduleIndex: number, 
  questions: Question[], 
  targetIndex: number
): boolean {
  if (targetIndex < 0 || targetIndex >= questions.length) {
    return false;
  }
  
  const answeredIds = getAnsweredQuestionIds(moduleIndex);
  
  // Can always go to an answered question
  if (answeredIds.includes(questions[targetIndex].id)) {
    return true;
  }
  
  // Can go to the first unanswered question
  for (let i = 0; i < questions.length; i++) {
    if (!answeredIds.includes(questions[i].id)) {
      return i === targetIndex;
    }
  }
  
  return false;
}
