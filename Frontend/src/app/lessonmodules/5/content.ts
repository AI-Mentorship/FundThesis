// Module 5 content with formatting guidance consistent with Module 1
const module5 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 5: Market Movement & Risk',
  intro: 'Markets move in response to information, liquidity flows, sentiment, and structural factors. By understanding these drivers, investors are better equipped to navigate market risks and fluctuations.',
  purpose: 'Understand the different explanations of market movement, the different types of risk, and how to measure them.',
  learnList: [
    'Explanations of market movement: the Efficient Market Hypothesis',
    'Types of Risk - systematic vs. idiosyncratic',
    'Measures of Volatility & Risk - Standard Deviation & Beta'
  ],
  sections: [
    { heading: 'Market Movement', body: 'There are three forms of the Efficient Market Hypothesis that is used to explain market movements: weak, semi-strong, and strong.\n\nThe weak form of EMH says that stock prices reflect historic price changes and volumes. This means that it is possible to "beat the market" and use historic data to identify patterns.\n\nThe semi-strong form says that stock prices already reflect all publicly available information, which means it is very hard to consistently beat the market.\n\nIn the same vein, the strong form says that stock prices reflect all information, public and private, including insider information.\n\nMost analysts and professionals agree that, in reality, the market represents a middleground between the semi-strong and strong forms of EMH. In essence, this means that prices move when new information comes out that investors did not expect. This is why surprises in earnings reports or economic data have such a big impact. When a company performs better or worse than analysts expected, the stock price quickly adjusts accordingly to reflect the new information.' },
    { heading: 'Types of Risk', body: 'In general, there are two types of risk that affect every security in the market: systematic and idiosyncratic risks.\n\nSystematic or Market risk is the kind of risk that affects the whole market, such as interest rate changes or recessions. You cannot avoid this type of risk no matter how many different stocks you own.\n\nIdiosyncratic or Unsystematic risk is specific to a single company or industry, like a product recall or management failure. This type of risk can be reduced through diversification.' },
    { heading: 'Measures of Volatility & Risk', body: 'To measure these risks, two measures are commonly used: Standard Deviation and Beta.\n\nAs discussed in the previous module, standard deviation measures how much an investment\'s returns tend to move up or down from their average, capturing both systematic and idiosyncratic risks. A higher standard deviation means the investment is more volatile and less predictable.\n\nOn the other hand, beta looks at how much an investment moves relative to the overall market. In measuring the covariance between the security\'s returns and the overall market, beta gives investors an idea of the amount of systematic risk associated with the security. A beta above one means it tends to move more than the market, while a beta below one means it is relatively more stable.' }
  ],
  keyPoints: [
    'Price movements reflect changing expectations which can be further defined by the various forms of the Efficient Market Hypothesis.',
    'Risk falls into two categories: systematic and idiosyncratic.',
    'Standard Deviation and Beta are two common measures of risk, capturing different aspects of volatility.'
  ]
};

export default module5;
