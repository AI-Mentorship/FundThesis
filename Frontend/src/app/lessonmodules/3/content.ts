// Module 3 content with formatting guidance consistent with Module 1
const module3 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 3: Buying vs Selling',
  intro: 'Buying and selling assets are the fundamental actions in investing, and both are based on an investor\'s practical decision-making.',
  purpose: 'Understand the reasons behind position entries and exits.',
  learnList: [
    'When to buy: valuation, momentum, and fundamentals',
    'When to sell: risk management and rebalancing',
    'Simple rules vs. discretionary judgment'
  ],
  sections: [
    { heading: 'Entry', body: 'Investors usually look for a mix of good value, strong momentum, and solid fundamentals before buying.\n\nValuation means checking if a stock\'s price is fair compared to its earnings or assets. Analysts at Investment Banks typically use discounted cash flow (DCF) models and comparable multiples to estimate a stock\'s intrinsic value.\n\nMomentum looks at whether the stock\'s price is trending upward and showing strength in the market. Strong momentum usually indicates an underlying market trend, like the current AI-wave, and shared investor sentiment.\n\nFundamentals focus on the company\'s health, like its profits, growth, and management quality. These can be easily found in the company\'s annual- and quarterly-published financial statements and earnings reports.' },
    { heading: 'Exit', body: 'Selling, or "cashing out," helps to realize any capital gain or loss. In general, most investors sell to mend a broken investment thesis, capitalize on better opportunities, rebalance portfolio weights, or when risk limits are reached.\n\nRebalancing trims outsized positions to control the weight of an asset in your portfolio. Assume you assigned 25% of your portfolio to Apple and its stock price doubles, all else constant, Apple now takes up a significantly larger portion of your portfolio. You might sell some shares to bring it back to 25%, thereby rebalancing your portfolio to maintain your desired mix of assets. This keeps your portfolio aligned with your goals and risk tolerance over time.\n\nThis also aids risk management, which essentially means setting clear limits to reduce potential losses, by stopping unwanted exposure to risky assets.' },
    { heading: 'Process and Discipline', body: 'It is advisable for all investors to use written plans and predefined levels. Remember that small and repeatable decisions that maximize risk-adjusted return beat one-off bets. Use tools like stop-losses, analyst reports, and diversification to boost your portfolio\'s chance of success.' }
  ],
  keyPoints: ['When to buy: Valuation, Momentum, and Fundamentals',
    'When to sell: Risk Management and Rebalancing',
    'Buying is about expected value; selling is about risk control and discipline.'
  ]
};

export default module3;
