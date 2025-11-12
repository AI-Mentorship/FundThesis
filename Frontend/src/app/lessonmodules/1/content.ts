// Centered layout for Module 1
const module1 = {
  layout: {
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      padding: '2rem',
    },
    content: {
      maxWidth: '800px',
      width: '100%',
    },
  },
  title: 'Module 1: Introduction to FundThesis',
  intro: `The goal of FundThesis is to teach the reasoning behind financial decision making. People often know how to buy a stock, but do not understand why an asset is considered valuable, how to evaluate risks, or how to construct a portfolio that aligns with long-term goals. This platform focuses on developing intuition and clear analytical thinking rather than memorizing isolated facts.`,
  purpose: `This module sets the foundation. You will learn what capital means, why markets exist, and how information influences price movement.`,
  learnList: [
    'What capital is and why it drives economic systems',
    'The role of markets in allocating resources',
    'The core idea behind investment: exchanging present value for potential future value',
    'How data, sentiment, and fundamentals interact to form asset pricing'
  ],
  sections: [
    {
      heading: 'Capital at Its Core',
      body: `Capital is stored work. It represents the accumulation of output over time. When you save money, purchase productive assets, or run a business, you are taking the work done in the past and positioning it to generate more work in the future. Understanding this concept is necessary before understanding investment strategy.`
    },
    {
      heading: 'Why Markets Exist',
      body: `Markets exist to solve two problems:\n1) Different people value the same resources differently.\n2) Information across the economy is distributed unevenly.\n\nMarkets match buyers and sellers so that resources end up with those who value them most. Price acts as the communication system that coordinates this distribution.`
    },
    {
      heading: 'Investment as a Trade of Time',
      body: `When investing, you give up the ability to use your money today. In return, you receive a claim on future value. This trade only makes sense if the expected future value outweighs the opportunity cost of the present. Every investment is a decision about time and confidence.`
    },
    {
      heading: 'A Simple Example',
      body: `Below is a demonstration graph used only to visualize how different expectations about growth can change valuations over time. This graph does not represent any specific company or asset. It is here to illustrate that small differences in growth rate assumptions can lead to significant valuation differences over long periods.`,
      imagePath: '/lessonmodules/lib/TestGraph.png'
    },
    {
      heading: 'Looking Ahead',
      body: `Later modules will break these ideas into precise analytical steps. You will learn how to:\n- Evaluate company financial statements\n- Understand macroeconomic signals\n- Measure risk and diversification\n- Construct and justify a portfolio strategy`
    }
  ],
  keyPoints: [
    'Capital is stored work.',
    'Markets allocate resources and coordinate information.',
    'Investment is a decision involving time, expectation, and uncertainty.'
  ]
};

export default module1;
