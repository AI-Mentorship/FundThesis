// Module 5 content with formatting guidance consistent with Module 1
const module5 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 5: Market Movement & Risk',
  intro: 'Markets move in response to information, liquidity flows, sentiment, and structural factors. Understanding these drivers helps frame price action.',
  purpose: 'Introduce primary sources of market movement and basic approaches to measuring and managing risk.',
  learnList: [
    'Core drivers: fundamentals, macro, sentiment',
    'Volatility as a proxy for uncertainty',
    'Simple risk tools: position sizing, diversification, stop-losses'
  ],
  sections: [
    { heading: 'Sources of Movement', body: 'Earnings surprises, policy changes, supply/demand imbalances, and narrative shifts alter expectations. Prices discount anticipated future cash flows plus risk premia.' },
    { heading: 'Volatility & Drawdowns', body: 'Volatility measures dispersion; drawdown tracks peak-to-trough loss. Both inform how much pain an investor may need to tolerate to realize a thesis.' },
    { heading: 'Managing Risk', body: 'Define maximum loss thresholds, size positions relative to conviction and volatility, and diversify across uncorrelated drivers. Update risk parameters when new information shifts the thesis.' }
  ],
  keyPoints: [
    'Price moves reflect changing expectations.',
    'Risk is multi-dimensional: magnitude, duration, and probability.',
    'Consistent sizing and diversification reduce tail impact.'
  ]
};

export default module5;
