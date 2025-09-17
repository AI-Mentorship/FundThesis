# Fundthesis

AI-Powered Financial Education Platform  
By: Ali Benrami and Hasnain Niazi

## Overview

Fundthesis empowers first-time and seasoned retail investors with real-time news summarization and AI-powered stock analysis for portfolio diversification. Users gain access to tools offering live and historical, in-depth company insights.

## Why It Matters

Fundthesis bridges the gap in financial literacy by simplifying portfolio selection. By unifying market data, sentiment, and model-driven insights, it helps users make informed decisions without juggling multiple information sources.

## Features

- Real-time market news summarization
- AI-driven stock insights and portfolio diversification guidance
- Company deep-dives with historical and live metrics
- Theme toggle (light/dark) and modern UI with shadcn/ui

## Tech Stack

- **Frontend**: TypeScript (React), Next.js (Better-Auth, shadcn/ui)
- **Backend**: Python (PyTorch, Pandas, NumPy, scikit-learn, XGBoost, Optuna, Joblib, Transformers, Sentence-Transformers, Google-GenerativeAI, LangChain, LlamaIndex, NLTK, TextBlob, TheFuzz, ChromaDB, Surprise)
- **APIs**: yFinance, Alpha Vantage, Twelve Data, Finnhub, IEX Cloud, NewsAPI, Marketaux, OpenFIGI, Financial Modeling Prep, SEC EDGAR API, Gemini, Cohere, Hugging Face Inference API, Plaid
- **Database**: PostgreSQL (for financial and user data)

## AI Components

- **Clustering (unsupervised)**: Segment users and stocks to power personalized guidance
- **Time-series forecasting**: ARIMA/Prophet with tree-based methods (e.g., XGBoost)
- **NLP**: Finance-tuned transformers (FinBERT, Sentence-BERT) + vector search for sentiment and summarization
- **Deep learning**: From MLPs to LSTMs/TabNet for mixed data types and robust risk profiles

## Prerequisites

- Node.js (LTS recommended). If you use `nvm`:

```bash
source ~/.nvm/nvm.sh
nvm use --lts
```

## Quick Start (Frontend)

Install dependencies and run the dev server (choose one package manager):

```bash
npm install && npm run dev
# or: yarn && yarn dev
# or: pnpm install && pnpm dev
# or: bun install && bun dev
```

Open `http://localhost:3000` to view the app.

## Project Structure

```text
fundthesis/
  src/
    app/
      layout.tsx        # App providers (e.g., ThemeProvider) and base layout
      page.tsx          # Landing page
      globals.css       # Global styles (Tailwind v4)
    components/
      ThemeButton.tsx   # UI for theme switching
      ui/               # shadcn/ui components (e.g., button)
  public/               # Static assets
  README.md
```

## Environment Variables

Create a `.env.local` file in the project root for local development. Examples:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
BETTER_AUTH_SECRET=replace_me
```

## Development Notes

- Styling uses Tailwind CSS v4 and PostCSS. See `src/app/globals.css` and `postcss.config.mjs`.
- App layout and providers live in `src/app/layout.tsx`.
- Main page: `src/app/page.tsx`.
- UI components under `src/components/`.

## Roadmap (Excerpt)

- Weeks 2–3: Data collection, cleaning, and storage (stocks + budgeting)
- Weeks 4–5: Unsupervised clustering (users and stocks) + visualization
- Weeks 6–7: Predictive modeling (stock scoring, budget forecasting)
- Weeks 8–9: Frontend integration + RAG assistant (LangChain + vector DB)
- Weeks 10–11: Final polish, presentation, and demo

See the full plan in `Fundthesis White Page.md`.

## Troubleshooting

- If themes don’t switch: ensure `next-themes` is installed and `ThemeProvider` wraps the app in `src/app/layout.tsx` with `attribute="class"`.
- If Node/npm not found: install Node LTS or use `nvm` (`nvm use --lts`).

## Contributing

1. Clone the repo and create a feature branch
2. Make changes with clear commits and open a PR
3. Ensure linting passes and add concise documentation where relevant

## License

TBD
