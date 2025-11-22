// Module 8 content with formatting guidance consistent with Module 1
const module8 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 8: Reading a Graph',
  intro: 'Foundations of interpreting price charts and basic technical indicators.',
  purpose: 'Equip learners to extract context from charts without overfitting patterns.',
  learnList: [
    'Understand axes, timeframes, and scaling',
    'Read common indicators: moving averages, RSI, MACD',
    'Identify trend, support, and resistance zones'
  ],
  sections: [
    { heading: 'Chart Basics', body: 'Line charts show closing price trends; candlesticks include open, high, low, close for richer intraday context. Timeframes (daily vs weekly) change noise vs signal balance.' },
    { heading: 'Indicators', body: 'Moving averages smooth price; RSI approximates momentum extremes; MACD compares short vs long-term trends. Indicators provide context—not standalone signals.' },
    { heading: 'Price Structure', body: 'Support and resistance reflect areas of prior supply/demand imbalance. Breakouts may indicate acceptance of a new valuation zone.' }
  ],
  keyPoints: ['Charts visualize behavior; disciplined interpretation prevents bias.']
};

export default module8;
