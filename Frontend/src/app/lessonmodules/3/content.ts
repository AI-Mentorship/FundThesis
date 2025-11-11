// Module 3 content with formatting guidance consistent with Module 1
const module3 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 3: Buying vs Selling',
  intro: 'This module covers the practical decision process behind buying and selling assets.',
  purpose: 'Build intuition for entries and exits using valuation, momentum, risk, and goals.',
  learnList: [
    'When to buy: valuation, momentum, and fundamentals',
    'When to sell: risk management and rebalancing',
    'Simple rules vs. discretionary judgment'
  ],
  sections: [
    { heading: 'Entry: Reasons to Buy', body: 'Buy when expected future value outweighs risk and opportunity cost. Signals include improving fundamentals, attractive valuation, and positive catalysts.' },
    { heading: 'Exit: Reasons to Sell', body: 'Sell when the thesis breaks, better opportunities arise, or risk limits are reached. Rebalancing trims outsized positions to control concentration.' },
    { heading: 'Process and Discipline', body: 'Use written plans and predefined levels. Small, repeatable decisions beat one-off bets. Respect stop-losses and avoid emotional chasing.' }
  ],
  keyPoints: ['Buying is about expected value; selling is about risk control and discipline.']
};

export default module3;
