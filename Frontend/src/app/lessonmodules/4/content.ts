// Module 4 content with formatting guidance consistent with Module 1
const module4 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 4: Portfolio Basics',
  intro: 'This module introduces portfolio concepts: diversification, allocation, and basic risk measures.',
  purpose: 'Teach why portfolios matter and how simple allocation choices influence long-term outcomes.',
  learnList: [
    'Diversification and correlation basics',
    'Asset allocation principles',
    'Simple risk measures (variance, drawdown)'
  ],
  sections: [
    { heading: 'Diversification', body: 'Combining imperfectly correlated assets can reduce volatility versus any single holding. Correlation determines the magnitude of benefit.' },
    { heading: 'Allocation', body: 'Strategic allocation aligns with long-term objectives (e.g., growth vs. preservation). Tactical shifts adjust for short-term views or risk changes.' },
    { heading: 'Rebalancing & Risk', body: 'Rebalancing trims winners and adds to laggards, enforcing discipline. Simple risk measures: variance (spread of returns) and drawdown (peak-to-trough decline).'}
  ],
  keyPoints: [
    'Allocation expresses goals; diversification stabilizes outcomes.',
    'Correlation drives real risk reduction, not raw asset count.',
    'Rebalancing is a systematic risk control mechanism.'
  ]
};

export default module4;
