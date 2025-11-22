export type Question = {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanations?: string[];
};
