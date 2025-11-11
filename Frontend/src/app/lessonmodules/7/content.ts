// Module 7 content with formatting guidance consistent with Module 1
const module7 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 7: Long-Term vs Short-Term Horizons',
  intro: 'Time horizon shapes strategy, risk tolerance, and the tools you use to measure success.',
  purpose: 'Clarify how long- vs short-term approaches differ and when to favor each.',
  learnList: [
    'Trade-offs between short-term trading and long-term investing',
    'Compounding and the time value of money',
    'Aligning horizon with goals and constraints'
  ],
  sections: [
    { heading: 'Short-Term', body: 'Emphasizes price action, liquidity, and execution. Requires quick feedback loops, strict risk limits, and acceptance of higher turnover and costs.' },
    { heading: 'Long-Term', body: 'Emphasizes fundamentals, compounding, and patience. Accepts interim volatility in pursuit of multi-year outcomes; periodic rebalancing maintains alignment.' },
    { heading: 'Blended Approaches', body: 'Many investors combine both horizons: core long-term holdings with selective short-term tilts to reflect near-term views or manage risk.' }
  ],
  keyPoints: ['Match horizon to your objectives and temperament; process beats prediction.']
};

export default module7;
