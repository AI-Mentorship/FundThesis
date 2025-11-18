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
    { id: '1-1', question: 'Intro: What is the primary goal of Module 1?', choices: ['Trade stocks', 'Learn basics', 'Do nothing', 'Sleep'], correctIndex: 1, explanations: ['Not quite, trading is later.', 'Nice, Module 1 introduces basics.', 'Not quite.', 'Not quite.'] },
    { id: '1-2', question: 'Which is a key output?', choices: ['Confusion', 'Loss', 'Understanding', 'Ignore'], correctIndex: 2, explanations: ['Not quite.', 'Not quite.', 'Nice.', 'Not quite.'] },
    { id: '1-3', question: 'How many lessons are here?', choices: ['Many', 'One', 'Zero', 'Ten'], correctIndex: 3, explanations: ['Not quite, vague.', 'Not quite.', 'Not quite.', 'Nice, the course has ten modules.'] },
    { id: '1-4', question: 'What should you do after Module 1?', choices: ['Proceed', 'Quit', 'Sleep', 'Forget'], correctIndex: 0, explanations: ['Nice, continue learning.', 'Not quite.', 'Not quite.', 'Not quite.'] }
  ],
  2: [
    { id: '2-1', question: 'What does buying a stock represent?', choices: ['Lending money to a company', 'Owning a piece of the company', 'Guaranteeing profits', 'Avoiding all risks'], correctIndex: 1, explanations: ['Not quite, that describes a bond.', 'Nice, a stock represents ownership in a company.', 'Not quite, stocks do not guarantee profits.', 'Not quite, stocks carry risk.'] },
    { id: '2-2', question: 'What is an ETF?', choices: ['A single company stock', 'A basket of many securities that trades like a stock', 'A type of bond', 'A savings account'], correctIndex: 1, explanations: ['Not quite, an ETF holds multiple securities.', 'Nice, an ETF bundles many securities and trades with intraday liquidity.', 'Not quite, ETFs are not bonds.', 'Not quite, ETFs are investment vehicles, not savings accounts.'] },
    { id: '2-3', question: 'Which type of shares typically come with voting rights?', choices: ['Preferred Shares', 'Common Shares', 'ETF Shares', 'Bond Shares'], correctIndex: 1, explanations: ['Not quite, Preferred Shares typically do not have voting rights.', 'Nice, Common Shares come with voting rights at shareholder meetings.', 'Not quite, ETF shares are not company shares.', 'Not quite, bonds do not have voting rights.'] },
    { id: '2-4', question: 'What is a key advantage of ETFs over mutual funds?', choices: ['Higher fees', 'Low costs and intraday liquidity', 'Guaranteed returns', 'No diversification'], correctIndex: 1, explanations: ['Not quite, ETFs typically have lower fees than mutual funds.', 'Nice, ETFs offer low costs and trade throughout the day like stocks.', 'Not quite, no investment guarantees returns.', 'Not quite, ETFs provide diversification.'] }
  ],
  3: [
    { id: '3-1', question: 'What are the three main factors investors look at before buying a stock?', choices: ['Valuation, momentum, and fundamentals', 'Price, color, and brand', 'Luck, timing, and weather', 'Fees, taxes, and regulations'], correctIndex: 0, explanations: ['Nice, investors analyze valuation, momentum, and fundamentals.', 'Not quite, color and brand are not investment criteria.', 'Not quite, these are not analytical factors.', 'Not quite, while important, these are not the primary buying factors.'] },
    { id: '3-2', question: 'What does rebalancing a portfolio mean?', choices: ['Selling all investments', 'Adjusting portfolio weights to maintain desired allocation', 'Only buying new stocks', 'Ignoring underperforming assets'], correctIndex: 1, explanations: ['Not quite, rebalancing adjusts weights, not liquidates everything.', 'Nice, rebalancing trims or adds to positions to maintain target allocations.', 'Not quite, rebalancing may involve both buying and selling.', 'Not quite, rebalancing addresses all assets including underperformers.'] },
    { id: '3-3', question: 'Which tool can help investors estimate intrinsic value?', choices: ['Discounted cash flow analysis', 'Stop-loss orders', 'Momentum indicators', 'Tax calculators'], correctIndex: 0, explanations: ['Nice, DCF (discounted cash flow) models estimate intrinsic value.', 'Not quite, stop-losses manage risk, not valuation.', 'Not quite, momentum indicators show trends, not intrinsic value.', 'Not quite, tax calculators do not estimate company value.'] },
    { id: '3-4', question: 'Why do investors sell stocks?', choices: ['To realize gains/losses, rebalance, or manage risk', 'Only when prices drop', 'To avoid all taxes', 'Never — holding forever is always best'], correctIndex: 0, explanations: ['Nice, selling serves multiple purposes including risk management and rebalancing.', 'Not quite, investors sell for various strategic reasons, not just losses.', 'Not quite, selling may incur taxes, not avoid them.', 'Not quite, strategic selling is often necessary.'] }
  ],
  4: [
    { id: '4-1', question: 'If a portfolio has $1000 in Stock A (expected return 10%) and $1000 in Stock B (expected return 6%), what is the portfolio\'s expected return?', choices: ['10%', '6%', '16%', '8%'], correctIndex: 3, explanations: ['Not quite, this is only Stock A\'s return.', 'Not quite, this is only Stock B\'s return.', 'Not quite, you don\'t add the returns directly.', 'Nice, the weighted average is (0.5 × 10%) + (0.5 × 6%) = 8%.'] },
    { id: '4-2', question: 'What does standard deviation measure in a portfolio?', choices: ['Expected return', 'How much returns typically move up or down from average', 'Tax efficiency', 'Number of stocks'], correctIndex: 1, explanations: ['Not quite, standard deviation measures volatility, not return.', 'Nice, standard deviation shows how much returns fluctuate.', 'Not quite, standard deviation does not measure taxes.', 'Not quite, it measures volatility, not quantity of holdings.'] },
    { id: '4-3', question: 'What does the Sharpe Ratio measure?', choices: ['Return per unit of risk taken', 'Total portfolio value', 'Number of investments', 'Tax burden'], correctIndex: 0, explanations: ['Nice, the Sharpe Ratio compares return to risk, helping assess if returns justify the risk.', 'Not quite, it measures risk-adjusted performance, not total value.', 'Not quite, it does not count investments.', 'Not quite, it does not measure taxes.'] },
    { id: '4-4', question: 'What is the primary benefit of diversification?', choices: ['Guaranteed profits', 'Higher fees', 'Mitigating volatility and maximizing risk-adjusted returns', 'Eliminating all risk'], correctIndex: 2, explanations: ['Not quite, diversification does not guarantee profits.', 'Not quite, diversification can reduce costs through ETFs.', 'Nice, diversification spreads risk and helps achieve better risk-adjusted returns.', 'Not quite, some risk always remains.'] }
  ],
  5: [
    { id: '5-1', question: 'According to the semi-strong form of the Efficient Market Hypothesis, what do stock prices reflect?', choices: ['Only historical data', 'All publicly available information', 'Only insider information', 'Future guaranteed returns'], correctIndex: 1, explanations: ['Not quite, that is the weak form.', 'Nice, the semi-strong form says prices reflect all public information.', 'Not quite, that is the strong form.', 'Not quite, EMH does not guarantee future returns.'] },
    { id: '5-2', question: 'What is systematic risk?', choices: ['Risk specific to one company', 'Risk that can be eliminated through diversification', 'Risk that affects the entire market, like recessions', 'Risk from poor management'], correctIndex: 2, explanations: ['Not quite, that is idiosyncratic risk.', 'Not quite, systematic risk cannot be diversified away.', 'Nice, systematic (market) risk affects all securities and cannot be avoided.', 'Not quite, that is idiosyncratic risk.'] },
    { id: '5-3', question: 'What does beta measure?', choices: ['How much an investment moves relative to the overall market', 'Total return of a portfolio', 'Dividend yield', 'Tax efficiency'], correctIndex: 0, explanations: ['Nice, beta measures covariance with the market, indicating systematic risk.', 'Not quite, beta measures volatility relative to the market, not total return.', 'Not quite, beta does not measure dividends.', 'Not quite, beta does not measure taxes.'] },
    { id: '5-4', question: 'What type of risk can be reduced through diversification?', choices: ['Systematic risk', 'Idiosyncratic risk', 'Market risk', 'Interest rate risk'], correctIndex: 1, explanations: ['Not quite, systematic risk affects the whole market and cannot be diversified away.', 'Nice, idiosyncratic (unsystematic) risk is company-specific and can be reduced by holding many stocks.', 'Not quite, market risk is another term for systematic risk.', 'Not quite, interest rate risk is a type of systematic risk.'] }
  ],
  6: [
    { id: '6-1', question: 'What does fundamental analysis examine?', choices: ['Price charts and trading patterns', 'A company\'s financial statements and business health', 'Only technical indicators', 'Market sentiment only'], correctIndex: 1, explanations: ['Not quite, that is technical analysis.', 'Nice, fundamental analysis looks at financials, earnings, and company strength.', 'Not quite, technical indicators are part of technical analysis.', 'Not quite, fundamental analysis focuses on business fundamentals.'] },
    { id: '6-2', question: 'What is the P/E ratio?', choices: ['Profit divided by expenses', 'Price divided by volume', 'Price divided by book value', 'Price divided by earnings'], correctIndex: 3, explanations: ['Not quite, that is not the P/E ratio.', 'Not quite, P/E does not involve volume.', 'Not quite, that describes the P/B ratio.', 'Nice, P/E ratio is price per share divided by earnings per share.'] },
    { id: '6-3', question: 'What is the purpose of a Discounted Cash Flow (DCF) analysis?', choices: ['To track historical prices', 'To estimate a company\'s intrinsic value based on future cash flows', 'To measure market sentiment', 'To calculate tax obligations'], correctIndex: 1, explanations: ['Not quite, DCF focuses on future value, not historical prices.', 'Nice, DCF projects future cash flows and discounts them to find intrinsic value.', 'Not quite, DCF is a valuation tool, not a sentiment measure.', 'Not quite, DCF does not calculate taxes.'] },
    { id: '6-4', question: 'How are valuation multiples like P/E used in company research?', choices: ['To compare companies within the same industry and identify undervalued or overvalued stocks', 'To predict exact future prices', 'To eliminate all investment risk', 'To calculate dividends'], correctIndex: 0, explanations: ['Nice, multiples help compare firms and spot relative value.', 'Not quite, multiples indicate relative value, not exact prices.', 'Not quite, multiples do not eliminate risk.', 'Not quite, multiples are valuation tools, not dividend calculators.'] }
  ],
  7: [
    { id: '7-1', question: 'What is a key characteristic of short-term investing?', choices: ['Holding investments for many years', 'Making quick gains over days, weeks, or months with higher volatility', 'Guaranteed low risk', 'No need for risk limits'], correctIndex: 1, explanations: ['Not quite, that describes long-term investing.', 'Nice, short-term investing focuses on fast gains but involves higher risk and price swings.', 'Not quite, short-term investing carries higher risk.', 'Not quite, strict risk limits are essential for short-term investing.'] },
    { id: '7-2', question: 'What is compounding returns?', choices: ['Earning gains on previous gains, creating a snowball effect', 'Losing money over time', 'Paying higher taxes', 'Trading frequently'], correctIndex: 0, explanations: ['Nice, compounding means your gains start earning gains themselves.', 'Not quite, compounding increases wealth.', 'Not quite, compounding is about investment growth, not taxes.', 'Not quite, compounding benefits long-term holders.'] },
    { id: '7-3', question: 'What does the time value of money principle state?', choices: ['Money today is worth less than money in the future', 'Money today is worth more than money in the future because it can be invested', 'All money has equal value regardless of time', 'Future money is guaranteed to grow'], correctIndex: 1, explanations: ['Not quite, money today is worth more.', 'Nice, money today can be invested and grow, making it more valuable than future money.', 'Not quite, time affects money\'s value.', 'Not quite, there are no guarantees in investing.'] },
    { id: '7-4', question: 'What is a blended investment approach?', choices: ['Only investing in bonds', 'Combining long-term holdings with short-term opportunities for balance', 'Avoiding all risk', 'Investing in a single stock'], correctIndex: 1, explanations: ['Not quite, blended approaches use multiple strategies.', 'Nice, blended approaches balance stability from long-term investments with flexibility from short-term trades.', 'Not quite, all investing involves some risk.', 'Not quite, blended approaches diversify across strategies.'] }
  ],
  8: [
    { id: '8-1', question: 'Graphs: A rising line shows?', choices: ['Price drop', 'Price increase', 'Volume', 'Time'], correctIndex: 1, explanations: ['Not quite.', 'Nice.', 'Not quite.', 'Not quite.'] },
    { id: '8-2', question: 'Support level is?', choices: ['Price ceiling', 'Volume spike', 'Price floor', 'News'], correctIndex: 2, explanations: ['Not quite.', 'Not quite.', 'Nice.', 'Not quite.'] },
    { id: '8-3', question: 'Resistance means?', choices: ['Price floor', 'Profit', 'Loss', 'Price ceiling'], correctIndex: 3, explanations: ['Not quite.', 'Not quite.', 'Not quite.', 'Nice.'] },
    { id: '8-4', question: 'Candlesticks show?', choices: ['Open/high/low/close', 'Only volume', 'Only price', 'Only time'], correctIndex: 0, explanations: ['Nice.', 'Not quite.', 'Not quite.', 'Not quite.'] }
  ],
  9: [
    { id: '9-1', question: 'What does ESG stand for?', choices: ['Environmental, Social, Governance', 'Energy, Stocks, Growth', 'Economy, Social, Government', 'Earnings, Sales, Growth'], correctIndex: 0, explanations: ['Nice, ESG stands for Environmental, Social, and Governance factors.', 'Not quite, that is not what ESG stands for.', 'Not quite, that is not the correct definition.', 'Not quite, that is not what ESG represents.'] },
    { id: '9-2', question: 'What does the "E" in ESG examine?', choices: ['Executive compensation', 'How a company affects the environment, like energy use and waste management', 'Employee turnover', 'Earnings growth'], correctIndex: 1, explanations: ['Not quite, that relates to governance.', 'Nice, the Environmental factor looks at a company\'s environmental impact.', 'Not quite, that relates to social factors.', 'Not quite, that is a financial metric.'] },
    { id: '9-3', question: 'What is greenwashing?', choices: ['A type of environmental cleanup', 'A government regulation', 'When companies falsely exaggerate their sustainability efforts', 'A method of water purification'], correctIndex: 2, explanations: ['Not quite, greenwashing is a deceptive practice.', 'Not quite, it is not a regulation.', 'Nice, greenwashing is when companies mislead about their sustainability to gain positive attention.', 'Not quite, that is unrelated to ESG.'] },
    { id: '9-4', question: 'What is a major challenge with ESG integration?', choices: ['ESG factors always guarantee higher returns', 'There is too much standardization', 'ESG is only relevant for tech companies', 'Lack of standardized metrics makes it difficult to compare firms'], correctIndex: 3, explanations: ['Not quite, ESG does not guarantee returns.', 'Not quite, the problem is lack of standardization.', 'Not quite, ESG applies to all industries.', 'Nice, the absence of standardized ESG metrics makes comparison difficult.'] }
  ],
  10: Module0Questions
};

// Mapping of question id -> target correct answer index (0-3) to avoid
// discernible patterns while keeping overall distribution roughly even.
// Some modules intentionally have duplicates (two questions sharing the same
// correct option position) and others have all four distinct.
const targetPositionMap: Record<string, number> = {
  // Module 1 (all distinct)
  '1-1': 2, '1-2': 0, '1-3': 3, '1-4': 1,
  // Module 2 (duplicate correct option index 1)
  '2-1': 1, '2-2': 2, '2-3': 1, '2-4': 3,
  // Module 3 (all distinct)
  '3-1': 0, '3-2': 2, '3-3': 1, '3-4': 3,
  // Module 4 (duplicate correct option index 3)
  '4-1': 3, '4-2': 1, '4-3': 0, '4-4': 3,
  // Module 5 (all distinct)
  '5-1': 2, '5-2': 3, '5-3': 0, '5-4': 1,
  // Module 6 (all distinct)
  '6-1': 1, '6-2': 3, '6-3': 2, '6-4': 0,
  // Module 7 (duplicate correct option index 2)
  '7-1': 2, '7-2': 0, '7-3': 2, '7-4': 1,
  // Module 8 (all distinct)
  '8-1': 3, '8-2': 2, '8-3': 0, '8-4': 1,
  // Module 9 (all distinct, ascending pattern kept intentionally at end)
  '9-1': 0, '9-2': 1, '9-3': 2, '9-4': 3
};

/**
 * Returns questions for a module with their choices/explanations reordered
 * so the correct answer sits at the target position defined in targetPositionMap.
 * The original data remains unchanged for other consumers.
 */
export function getQuestions(moduleIndex: number): Question[] {
  const original = questionsByModule[moduleIndex] ?? [];
  // Only transform modules 1-9; module 10 (demo) keeps original ordering.
  if (moduleIndex >= 10) return original.slice();

  return original.map(q => {
    const target = targetPositionMap[q.id];
    if (target == null || q.correctIndex === target) {
      // Either no mapping or already at target
      return { ...q };
    }
    const correctChoice = q.choices[q.correctIndex];
    const correctExplanation = q.explanations ? q.explanations[q.correctIndex] : undefined;

    // Build arrays of remaining choices/explanations (preserving relative order)
    const otherChoices: string[] = [];
    const otherExplanations: string[] = [];
    q.choices.forEach((c, idx) => {
      if (idx !== q.correctIndex) {
        otherChoices.push(c);
        if (q.explanations) otherExplanations.push(q.explanations[idx]);
      }
    });

    // Insert the correct answer at the target index among the others
    const newChoices: string[] = [];
    const newExplanations: string[] = [];
    for (let i = 0, oi = 0; i < q.choices.length; i++) {
      if (i === target) {
        newChoices.push(correctChoice);
        if (correctExplanation) newExplanations.push(correctExplanation);
      } else {
        newChoices.push(otherChoices[oi]);
        if (q.explanations) newExplanations.push(otherExplanations[oi]);
        oi++;
      }
    }

    return {
      ...q,
      choices: newChoices,
      explanations: q.explanations ? newExplanations : undefined,
      correctIndex: target
    };
  });
}

export default questionsByModule;
