# Fundthesis

AI-Powered Financial Education Platform  
By: Ali Benrami and Hasnain Niazi

## Project Description

Fundthesis empowers first-time and seasoned retail investors with real-time news summarizations and AI-powered stock analysis for portfolio diversification. Users gain access to intelligent tools offering live and historical in-depth company insights.

## Project Importance

Fundthesis bridges the gap in financial literacy by simplifying portfolio selection. By unifying market data, sentiment, and model-driven insights, it helps users make informed decisions without juggling multiple information sources. The focus on education and accessibility lowers the barrier to entry in retail investing.

## Tech Stack and Tools

- **Frontend**: TypeScript (React), Next.js (Better-Auth, shadcn/ui)
- **Backend**: Python (PyTorch, Pandas, NumPy, scikit-learn, XGBoost, Optuna, Joblib, Transformers, Sentence-Transformers, Google-GenerativeAI, LangChain, LlamaIndex, NLTK, TextBlob, TheFuzz, ChromaDB, Surprise)
- **APIs**: yFinance, Alpha Vantage, Twelve Data, Finnhub, IEX Cloud, NewsAPI, Marketaux, OpenFIGI, Financial Modeling Prep, SEC EDGAR API, Gemini, Cohere, Hugging Face Inference API, Plaid
- **Database**: PostgreSQL (for financial and user data)

## The AI Element

- **Clustering (unsupervised)**: Segment users and stocks to power personalized guidance
- **Time-series forecasting**: ARIMA/Prophet with tree-based methods (e.g., XGBoost)
- **NLP**: Finance-tuned transformers (FinBERT, Sentence-BERT) + vector search for sentiment and summarization
- **Deep learning**: From MLPs to LSTMs/TabNet for mixed data types and robust risk profiles

## Getting Started (Frontend)

Prerequisite: Node.js and a package manager (npm, yarn, pnpm, or bun). If you use `nvm`:

```bash
source ~/.nvm/nvm.sh
nvm use --lts
```

Install dependencies and run the dev server:

```bash
# choose one package manager
npm install
npm run dev
# or: yarn && yarn dev
# or: pnpm install && pnpm dev
# or: bun install && bun dev
```

Open `http://localhost:3000` to view the app.

## Development Notes

- Update styles in `src/app/globals.css`
- Tailwind CSS is used for rapid, utility-first styling. See `tailwind.config.js` for customization and refer to `src/app/globals.css` for base styles.
- App layout and providers in `src/app/layout.tsx`
- Main page in `src/app/page.tsx`
- UI components in `src/components/`

## Roadmap (Excerpt)

- Weeks 2–3: Data collection, cleaning, and storage (stocks + budgeting)
- Weeks 4–5: Unsupervised clustering (users and stocks) + visualization
- Weeks 6–7: Predictive modeling (stock scoring, budget forecasting)
- Weeks 8–9: Frontend integration + RAG assistant (LangChain + vector DB)
- Weeks 10–11: Final polish, presentation, and demo

## Contributing

1. Clone the repo and create a feature branch
2. Make changes with clear commits and open a PR
3. Ensure linting passes and add concise documentation where relevant

## License

TBD
