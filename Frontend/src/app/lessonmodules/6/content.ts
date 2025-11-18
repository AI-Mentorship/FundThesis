// Module 6 content with formatting guidance consistent with Module 1
const module6 = {
  layout: {
    wrapper: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    content: { maxWidth: '800px', width: '100%' },
    format: { headerColor: '#064e3b', headerFont: 'Lato, Arial, sans-serif', bodyFont: 'Georgia, serif' }
  },
  title: 'Module 6: Company Research',
  intro: 'Understanding the practical process for researching companies through their financials, business model, and relative position.',
  purpose: 'Provide a reproducible, checklist-driven framework for company analysis.',
  learnList: [
    'Fundamental and Technical analysis overview',
    'Comparing firms using multiple lenses',
    'Finding intrinsic value through different valuation methods'
  ],
  sections: [
    { heading: 'Fundamental and Technical Analysis', body: 'Fundamental analysis looks at a company\'s financial statements to determine the real-world strength of a company, such as its earnings, growth potential, and financial health, to judge whether its stock is fairly priced.\n\nTechnical analysis focuses on price charts, trends, and trading patterns to model and predict where the stock might move next.\n\nWhile fundamental analysis asks “What is this company truly worth,” technical analysis asks “What is the market likely to do next.” Many investors use a mix of both to guide their investment decisions.' },
    { heading: 'Multiples', body: 'One of the most common tools for comparing companies is the use of multiples, which are simple ratios that relate a company\'s value to a financial measure like earnings or cash flow.\n\nCommon multiples include the P/E ratio (price divided by earnings), EV/EBITDA (enterprise value divided by earnings before interest, taxes, depreciation, and amortization), and P/B (price divided by book value).\n\nThese help investors see how expensive or cheap a company is relative to its financial performance. By comparing the multiples of similar companies in the same industry, investors can spot which firms look undervalued or overvalued based on how they stack up against their peers.' },
    { heading: 'Finding Intrinsic Value', body: 'Intrinsic value is an estimate of what a company is truly worth based on its future cash generation.\n\nA Discounted Cash Flow (DCF) is one of the main ways to calculate this value by projecting a company\'s future cash flows and then discounting them back to today using a required rate of return. To do a DCF, you estimate future cash flows, choose a discount rate that reflects the risk, and add up the present value of those cash flows.\n\nFor a very simple example, imagine a company will generate $100 for the next 3 years, and your discount rate is 10%. After year 3, assume the cash flows grows at 2% into perpetuity. The present value of the first three payments is about $249, and the terminal value (the value of all cash flows after year 3) would be about $1,275 which discounted back to today is roughly $958. After adding the present values of the three payments and the terminal value, the simple DCF estimate of intrinsic value is about $1,207.\n\nRelative multiples can also be used to estimate a firm\'s intrinsic value by comparing its multiples to the mean or median of similar companies.' }
  ],
  keyPoints: [
    'Fundamental analysis focuses on a company\'s financial health, while technical analysis looks at price trends and patterns.',
    'Multiples like P/E and EV/EBITDA help compare companies within the same industry to identify undervalued or overvalued stocks.',
    'Intrinsic value can be estimated using Discounted Cash Flow (DCF) analysis or relative multiples.'
    ]
};

export default module6;
