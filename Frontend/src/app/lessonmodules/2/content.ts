// Module 2 content with formatting guidance consistent with Module 1
const module2 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    // Formatting parity with Module 1 page: headings use Lato and #064e3b; body uses Georgia.
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 2: What is a Stock and ETF',
  intro: 'This module explains the basic building blocks of equity investing: stocks (direct ownership) and ETFs (pooled exposure).',
  purpose: 'Provide the conceptual difference between owning individual shares and using ETFs for diversified exposure.',
  learnList: [
    'Define a stock and how ownership shares work',
    'Explain what an ETF is and common ETF structures',
    'Discuss liquidity, dividends, and voting rights in equities'
  ],
  sections: [
    {
      heading: 'Stocks — Ownership and Claims',
      body: 'A stock represents partial ownership in a corporation. Shareholders may receive dividends, vote on key matters, and hold a residual claim on assets after liabilities.'
    },
    {
      heading: 'ETFs — Diversification Vehicle',
      body: 'An ETF (Exchange Traded Fund) bundles many securities into a single instrument. ETFs trade like stocks but provide instant diversification and often track an index.'
    },
    {
      heading: 'When to Use Each',
      body: 'Individual stocks enable targeted ideas and active research; ETFs simplify broad exposure and asset allocation. Many investors use both depending on objective and time horizon.'
    }
  ],
  keyPoints: [
    'Stocks = direct ownership; ETFs = pooled baskets.',
    'ETFs trade intraday like stocks and can be cost-efficient.',
    'Choose the tool that matches your goal and diversification needs.'
  ]
};

export default module2;
