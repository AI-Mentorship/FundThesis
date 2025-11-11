// Module 6 content with formatting guidance consistent with Module 1
const module6 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 6: Company Research',
  intro: 'A practical process for researching companies: financials, business model, and competitive position.',
  purpose: 'Provide a reproducible, checklist-driven framework for company analysis.',
  learnList: [
    'Read balance sheet, income statement, and cash flow',
    'Identify competitive advantages and industry dynamics',
    'Use simple valuation heuristics'
  ],
  sections: [
    { heading: 'Financial Statements', body: 'Income statement shows profitability; balance sheet shows assets, liabilities, and equity; cash flow reveals operational health and capital needs.' },
    { heading: 'Competitive Analysis', body: 'Assess moat, market share, switching costs, and barriers to entry. Management quality and incentives shape long-term execution.' },
    { heading: 'Valuation Cross-Checks', body: 'Use multiples (e.g., P/E, EV/EBITDA) and discounted cash flow as sanity checks; compare to peers and history.' }
  ],
  keyPoints: ['Cash flow quality matters; incentives and structure drive outcomes.']
};

export default module6;
