// Module 4 content with formatting guidance consistent with Module 1
const module4 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 4: Portfolio Basics',
  intro: 'To an investor, a portfolio is more than a collection of assets. It is a carefully constructed tool to achieve financial goals with palatable risk, that determines whether an investor is successful or not.',
  purpose: 'Understand why portfolios matter and how simple allocation choices influence long-term outcomes.',
  learnList: [
    'Simple Portfolio Mathematics',
    'Risk Measures: standard deviation, variance, drawdown',
    'Diversification & the Sharpe Ratio'
  ],
  sections: [
    { heading: 'Simple Portfolio Mathematics', body: 'A portfolio is a collection of assets classified as investments due to an expectation of positive future returns.\n\nFor a portfolio, its expected return is the average amount you think your investments might earn over time, under various market conditions, based on past performance or reasonable assumptions.\n\nFor example, if you have a portfolio consisting $1000 of Apple (AAPL) and $1000 of Goldman Sachs (GS) stock, and the expected return on AAPL is 10% and on GS is 6% after accounting for each stock\'s performance in good, normal, or bad market conditions, the overall expected return of the portfolio would be the weighted average of the two.\n\nIn this case, we find that both weights are $1000/$2000 = 0.5, hence, the expected return would be (0.5 x 10%) + (0.5 x 6%) = 8%. In Finance, expected returns are used as the basis for a number of other complicated formulae and calculations.' },
    { heading: 'Portfolio Risk', body: 'There are a number of ways investors measure different kinds of investment risk. Some common methods include standard deviation, variance, and drawdown.\n\nVariance measures how far returns tend to be from their average, and Standard Deviation is just the square root of that number, making it easier to understand as “how much returns usually move up or down.” When these numbers are high, the investment is more volatile and less predictable.\n\nDrawdowns looks at a more drastic outcome for investors. It measures how much your investment falls from a peak to a low point, showing the worst losses you might face during a downturn. This is important to consider because there is always the potential for loss in any investment.' },
    { heading: 'Diversification', body: 'Diversification and allocation are about spreading your money across different assets so that if one investment does poorly, others can balance it out. This concept is vital to mitigating volatility of returns in a portfolio, allowing investors to consistently maximize their risk-adjusted return.\n\nThe Sharpe Ratio sums all this up by comparing how much return you get for each unit of risk you take, helping you judge whether an investment is rewarding you fairly for the risk involved. A higher Sharpe Ratio means you are getting better returns for the additional risk you are taking on.\n\nIt is measured by subtracting the risk-free rate (usually returns on "risk-free" government bonds) from the portfolio\'s expected return, and then dividing that by the portfolio\'s standard deviation.' }
  ],
  keyPoints: [
    'Expected return is a weighted average of asset returns and the backbone of portfolio theory.',
    'Risk is measured in many ways, each indicating a different type of investment risk.',
    'Diversification is integral to generated sustained positive returns, and maximizing an investor\'s risk-adjusted return and Sharpe Ratio.'
  ]
};

export default module4;
