// Module 2 content with formatting guidance consistent with Module 1
const module2 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    // Formatting parity with Module 1 page: headings use Lato and #064e3b; body uses Georgia.
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 2: What is a Stock and ETF',
  intro: 'Equities represents the backbone of the financial markets, providing ownership stakes in companies and giving investors a claim on the firm\'s cash flows.',
  purpose: 'Understand the mechanics of owning individual shares and recent emergence of ETFs to provide diversified exposure.',
  learnList: [
    'Define a stock and understand how they provide ownership in an entity',
    'Discuss liquidity, dividends, and voting rights in equities',
    'Explain what is an ETF and their importance in balanced portfolios'    
  ],
  sections: [
    {
      heading: 'Stocks',
      body: 'A stock represents a small piece of ownership in a company. When you buy a stock, you\'re essentially buying a share of that company and owning a fraction of its assets and profits.\n\nFor example, if you buy one share of Apple, you become a tiny part-owner of Apple. The value of your stock goes up or down based on how well the company performs and how investors feel about its future. If the company grows and earns more money, your stock might become more valuable, and you can sell it for a profit.\n\nSome companies also pay dividends, which are small cash payments to shareholders as a reward for investing.\n\nMost shares are often classified as Preferred Shares and Common Shares. Preferred Shares have priority on dividends and are higher in hierarchical claims on assets in case of liquidation, as such, they usually trade at higher prices when compared to Common Shares. On the other hand, Common Shares instead come with voting rights at shareholder meetings so that shareholders can influence company decisions.'
    },
    {
      heading: 'ETFs',
      body: 'An Exchange Traded Fund (ETF) bundles many securities, including the stocks of various companies, into a single instrument. ETFs trade like stocks but provide instant diversification and often track an index.\n\nETFs represent an alternative to the rigid and high fee structure of mutual funds, allowing investors to still buy broad market exposure but with low costs and intraday liquidity. As a result, an ETF is a basket that holds many different stocks, bonds, or other assets. When you buy one share of an ETF, you\'re buying a small slice of that entire basket and thereby gaining ownership to all underlying assets within the ETF.'
    },
    {
      heading: 'When to Use Each',
      body: 'Individual stocks require active research and enable targeted investments into a specific firm. ETFs are a vehicle to easily achieve broad exposure and asset allocation. Many investors use both depending on objective and time horizon.'
    }
  ],
  keyPoints: [
    'Stocks = direct ownership; ETFs = pooled baskets.',
    'ETFs also trade intraday like stocks and can be cost-efficient.',
    'Choose the tool that matches your goal and diversification needs.'
  ]
};

export default module2;
