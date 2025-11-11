// Module 9 content with formatting guidance consistent with Module 1
const module9 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 9: Sustainability Factors',
  intro: 'Integrating environmental, social, and governance (ESG) factors into investment research can surface hidden risks and long-term value drivers.',
  purpose: 'Show how ESG considerations can supplement traditional financial analysis without replacing core metrics.',
  learnList: [
    'High-level ESG concepts',
    'How sustainability affects risk and opportunity',
    'Simple guiding questions during research'
  ],
  sections: [
    { heading: 'ESG Overview', body: 'Environmental covers emissions and resource efficiency; Social addresses labor practices and product impact; Governance examines board structure, incentives, and transparency.' },
    { heading: 'Materiality', body: 'Focus only on factors that can plausibly alter cash flows, brand strength, or regulatory exposure. Sector context matters: material issues differ for software vs manufacturing.' },
    { heading: 'Research Questions', body: 'What regulatory changes could alter costs? Are incentives aligned with sustainable growth? Does supplier or customer concentration magnify ESG-related disruptions?' }
  ],
  keyPoints: ['ESG is a lens, not a replacement; materiality and context drive relevance.']
};

export default module9;
