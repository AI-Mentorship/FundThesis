// Lightweight local "DB" for user progress. Persists to localStorage under key 'ft_user_progress'
// Store answered question ids per module so progress is stable across navigations
type StorageShape = Record<number, string[]>;

const STORAGE_KEY = 'ft_user_progress_v1';

function read(): StorageShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StorageShape;
  } catch (e) {
    return {};
  }
}

function write(map: StorageShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    // notify any UI listeners (other components/tabs) that progress changed
    try { window.dispatchEvent(new Event('ft-progress-changed')); } catch (e) { /* ignore */ }
  } catch (e) { /* ignore */ }
}

/**
 * Get progress percent for a module. totalQuestions defaults to 4.
 */
export function getProgress(moduleIndex: number, totalQuestions = 4): number {
  const map = read();
  const answered = map[moduleIndex] ?? [];
  const pct = Math.round((answered.length / Math.max(1, totalQuestions)) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * Return the number of answered questions for a module (and totalQuestions is kept for callers).
 */
export function getAnsweredCount(moduleIndex: number, totalQuestions = 4): { answered: number; total: number } {
  const map = read();
  const answered = (map[moduleIndex] ?? []).length;
  return { answered, total: totalQuestions };
}

/**
 * Mark a question as answered for a module. Returns the new percent.
 */
export function markQuestionAnswered(moduleIndex: number, questionId: string, totalQuestions = 4): number {
  const map = read();
  const arr = Array.isArray(map[moduleIndex]) ? map[moduleIndex] : [];
  if (!arr.includes(questionId)) {
    arr.push(questionId);
    map[moduleIndex] = arr;
    write(map);
  }
  return getProgress(moduleIndex, totalQuestions);
}

export function resetAllProgress() {
  write({});
}
