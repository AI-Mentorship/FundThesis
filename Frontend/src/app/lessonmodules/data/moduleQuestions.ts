import { Question } from '../components/types';

// Demo questions (previously in module0Questions.ts)
const Module0Questions: Question[] = [
  {
    id: 'q1',
    question: 'What is the bid price?',
    choices: ['The price to buy immediately', 'The price to sell immediately', "Yesterday's close", 'The 52-week high'],
    correctIndex: 1,
    explanations: [
      'That describes the ask.',
      'Correct — bid is what buyers are willing to pay (sell to).',
      'Not correct — previous close is different.',
      'No — 52-week high is unrelated.'
    ]
  },
  {
    id: 'q2',
    question: 'What is a market order?',
    choices: ['An order executed at the next available price', 'An order that sets a price limit', 'An order that cancels automatically', 'An order only during market open'],
    correctIndex: 0,
    explanations: [
      'Correct — market orders execute at available prices.',
      'That is a limit order.',
      'Not true — market orders do not auto-cancel.',
      'Market orders can execute during open/continuous trading.'
    ]
  },
  {
    id: 'q3',
    question: 'Which action increases your shares?',
    choices: ['Sell', 'Buy', 'Short', 'Close'],
    correctIndex: 1,
    explanations: ['Selling reduces shares.', 'Correct — buying increases your shares.', 'Shorting is selling borrowed shares.', 'Close is ambiguous.']
  },
  {
    id: 'q4',
    question: 'What does ask price represent?',
    choices: ['Lowest price a seller will accept', 'Highest a buyer will pay', 'Average price today', 'Opening price'],
    correctIndex: 0,
    explanations: ["Correct — ask is the seller's price.", 'That is the bid.', 'Not correct — average is different.', 'Not the opening price.']
  }
];

const questionsByModule: Record<number, Question[]> = {
  1: [
    { id: '1-1', question: 'Intro: What is the primary goal of Module 1?', choices: ['Learn basics', 'Trade stocks', 'Do nothing', 'Sleep'], correctIndex: 0, explanations: ['Correct — Module 1 introduces basics.', 'No — trading is later.', 'No.', 'No.'] },
    { id: '1-2', question: 'Which is a key output?', choices: ['Understanding', 'Confusion', 'Loss', 'Ignore'], correctIndex: 0, explanations: ['Yes.', 'No.', 'No.', 'No.'] },
    { id: '1-3', question: 'How many lessons are here?', choices: ['Many', 'One', 'Ten', 'Zero'], correctIndex: 2, explanations: ['Vague.', 'No.', 'Yes — the course has ten modules.', 'No.'] },
    { id: '1-4', question: 'What should you do after Module 1?', choices: ['Proceed', 'Quit', 'Sleep', 'Forget'], correctIndex: 0, explanations: ['Correct — continue learning.', 'No.', 'No.', 'No.'] }
  ],
  2: [
    { id: '2-1', question: 'Stock basics: Which represents ownership?', choices: ['Stock', 'Bond', 'Cash', 'Option'], correctIndex: 0, explanations: ['Correct — stock represents ownership.', 'Bond is debt.', 'Cash is currency.', 'Option is derivative.'] },
    { id: '2-2', question: 'ETF stands for?', choices: ['Exchange Traded Fund', 'Electronic Trade Fund', 'Extra TF', 'None'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '2-3', question: 'Stocks trade on?', choices: ['Exchanges', 'Farmers market', 'Gym', 'Library'], correctIndex: 0, explanations: ['Correct — exchanges.', 'No.', 'No.', 'No.'] },
    { id: '2-4', question: 'A long-term investor...', choices: ['Holds for years', 'Day trades', 'Ignores news', 'Hedges always'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] }
  ],
  3: [
    { id: '3-1', question: 'Buying vs Selling: Buying increases your...', choices: ['Shares', 'Debt', 'Tax', 'Fees'], correctIndex: 0, explanations: ['Correct — buying increases shares.', 'No.', 'No.', 'No.'] },
    { id: '3-2', question: 'Selling does what?', choices: ['Reduces holdings', 'Increases holdings', 'Does nothing', 'Deletes history'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '3-3', question: 'Market order =', choices: ['Execute at market', 'Set price', 'Cancel', 'Wait'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '3-4', question: 'Limit order =', choices: ['Set a limit price', 'Random', 'Immediate', 'Illegal'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] }
  ],
  4: [
    { id: '4-1', question: 'Portfolio: Diversification means?', choices: ['Spread risk', 'All-in-one', 'Single stock only', 'No idea'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '4-2', question: 'ETF helps with?', choices: ['Diversification', 'Isolation', 'Risk only', 'Fees only'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '4-3', question: 'Asset allocation is?', choices: ['Split investments', 'Sell everything', 'Ignore return', 'Pay fees'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '4-4', question: 'Rebalance means?', choices: ['Adjust weights', 'Buy more', 'Hold forever', 'Sleep'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] }
  ],
  5: [
    { id: '5-1', question: 'Market movement: Volatility means?', choices: ['Price swings', 'Stable price', 'No trades', 'No volume'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '5-2', question: 'Risk is?', choices: ['Chance of loss', 'Guarantee of profit', 'Free money', 'Zero'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '5-3', question: 'Beta measures?', choices: ['Volatility vs market', 'Tax', 'Fees', 'Volume'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '5-4', question: 'Diversify reduces?', choices: ['Idiosyncratic risk', 'Market risk', 'All risks', 'No risk'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] }
  ],
  6: [
    { id: '6-1', question: 'Research: Fundamental analysis looks at?', choices: ['Financials', 'Astrology', 'Weather', 'Rumors'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '6-2', question: 'Earnings are?', choices: ['Profit', 'Debt', 'Dividend only', 'Tax'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '6-3', question: 'P/E ratio measures?', choices: ['Price vs earnings', 'Volume', 'Momentum', 'Fees'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '6-4', question: 'Analyst reports are?', choices: ['Research notes', 'Official law', 'Fake always', 'Prices'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] }
  ],
  7: [
    { id: '7-1', question: 'Long vs short: Long means?', choices: ['Buy and hold', 'Sell first', 'Borrow only', 'Ignore'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '7-2', question: 'Short means?', choices: ['Sell borrowed', 'Buy extra', 'Hold cash', 'Ignore'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '7-3', question: 'Time horizon is?', choices: ['Investment length', 'Price only', 'Tax code', 'Broker'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '7-4', question: 'Compound interest works by?', choices: ['Earning on earnings', 'Losing money', 'Fees only', 'Ignore'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] }
  ],
  8: [
    { id: '8-1', question: 'Graphs: A rising line shows?', choices: ['Price increase', 'Price drop', 'Volume', 'Time'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '8-2', question: 'Support level is?', choices: ['Price floor', 'Price ceiling', 'Volume spike', 'News'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '8-3', question: 'Resistance means?', choices: ['Price ceiling', 'Price floor', 'Profit', 'Loss'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '8-4', question: 'Candlesticks show?', choices: ['Open/high/low/close', 'Only volume', 'Only price', 'Only time'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] }
  ],
  9: [
    { id: '9-1', question: 'Sustainability: ESG stands for?', choices: ['Environmental, Social, Governance', 'Energy, Stocks, Growth', 'Economy, Social, Govt', 'None'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '9-2', question: 'Sustainability factors affect?', choices: ['Long-term performance', 'Short-term only', 'Never', 'Taxes'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '9-3', question: 'Greenwashing is?', choices: ['False sustainability claims', 'True claims', 'Government policy', 'Tax code'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] },
    { id: '9-4', question: 'Materiality in ESG means?', choices: ['What matters financially', 'Irrelevant topics', 'Only PR', 'Ignore'], correctIndex: 0, explanations: ['Correct.', 'No.', 'No.', 'No.'] }
  ],
  10: Module0Questions
};

export function getQuestions(moduleIndex: number): Question[] {
  return questionsByModule[moduleIndex] ?? [];
}

export default questionsByModule;
