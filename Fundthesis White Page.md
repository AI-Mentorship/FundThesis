# **Fundthesis**

AI-Powered Financial Education Platform
By: Ali Benrami and Hasnain Niazi

# **Project Description.**

Fundthesis is a financial educational tool which is meant to empower first-time and seasoned retail investors. Funthesis plans on accomplishing this by giving investors access to real-time news summarizations and AI-powered stock analysis on portfolio diversification. Users also have access to intelligent custom tools such as live and historical in-depth custom company insights.

# **Project Importance.**

Fundthesis helps bridge the gap in financial literacy for new investors by making portfolio selection easier to understand and act on. Using real-time data and smart stock insights, it empowers users to make informed financial decisions without needing to access and individually process multiple streams of information. By focusing on education and accessibility, Fundthesis plans to lower the barrier to entry in retail investing.

# **Tech Stack and Tools.**

Programming Language(s):

* Python
  * Used to handle essential backend tasks such as data processing, visualization, machine learning, and REST API functionality. Additionally used to power the secure authentication system.
* SQL
  * Used for performing CRUD operations on financial data retrieved from external APIs and webscraping models and a self-managed database is used to store and serve user data, stock insights, and portfolio information to the frontend.
* TypeScript
  * Used to aesthetically present financial data, display visualized stock insights, and power the interactive frontend experience. Includes real-time updates, graphical charting interfaces, portfolio budgeting tools, and accessible user dashboards.

Tech-Stack as listed:

* Frontend
  * Typescript (React)
  * Next.js (Better-Auth and Shadcn)
* Backend
  * Python (PyTorch, Pandas, Numpy, Scikit-Learn, XGBoost, Optuna, Joblib, Transformers, Sentence-Transformers, Google-GenerativeAI, Langchain, llama-index, NLTK, TextBlob, TheFuzz, ChromaDB, and Surprise)
* API(s)
  * yFinance, Alpha Vantage, Twelve Data, Finnhub, IEX Cloud, NewsAPI, Marketaux, OpenFIGI, Financial Modeling Prep, SEC EDGAR API, Gemini, Cohere, Hugging Face Inference API, and Plaid

# **The AI Element.**

The AI elements used in this project include clustering (unsupervised learning), time-series forecasting and modeling, natural language processing (NLP), as well as deep learning.

At Fundthesis, AI is used to power our insight providing models. We begin by analyzing transaction histories and portfolio data to uncover consistently occurring groupings of users and stocks. These clusters will drive the personal investment guidance you see and help surface stocks that fit each user’s unique investment habits.

For price forecasting we intend on utilizing years of price data into forward-looking alerts by combining classical time-series models like ARIMA and Prophet with tree-based methods such as XGBoost.

In conjunction, our NLP pipeline reads financial news, earnings transcripts, and SEC filings using finance-tuned transformers (FinBERT, Sentence-BERT) and vector search to analyze sentiment and transform dense, cluttered reports into plain English.

Finally, deep learning models from simple MLPs to LSTMs and TabNet—digest complex, mixed data types and deliver rich risk profiles and stock scores that reflect every nuance of the market.

**Supporting Research.**

* [https://bfi.uchicago.edu/wp-content/uploads/2023/07/BFI\_WP\_2023-100.pdf](https://bfi.uchicago.edu/wp-content/uploads/2023/07/BFI_WP_2023-100.pdf)
* [https://arxiv.org/pdf/1911.13288](https://arxiv.org/pdf/1911.13288)
* [https://aclanthology.org/P18-1183.pdf](https://aclanthology.org/P18-1183.pdf)

# **Tentative Project Timeline.**

**Week 1: Project Kickoff & Environment Setup**

* Team introductions and availability check
* Overview of Nochefy's goals, features, and AI components
* Setup communication channels (GitHub, Discord, group chat, Notion, etc.)
* Set up environments (Python virtual envs, Anaconda, Jupyter, VS Code)
* Assign initial roles based on interest (frontend, backend, AI, data)

**References.**

* Project charter
* Google Docs / Notion workspace

**HW:**

* Everyone clone the GitHub repo
* Install required base dependencies (pandas, numpy, etc.)
* Research relevant finance APIs (e.g., yfinance, Alpha Vantage)

**Weeks 2–3: Data Collection & Cleaning (Stocks \+ Budgeting)**

* Get familiar with stock data APIs (yfinance, Twelve Data, etc.)
* Set up API wrappers and fetch test datasets (stock prices, company data, sentiment)
* Gather and format budgeting/spending data for the smart assistant
* Clean and preprocess data: standardization, time-series formatting, normalization
* Store clean datasets in SQL or CSV/Parquet format for modeling

**References:**

* API documentation
* pandas/numpy docs
* SQL basics (for budget data queries)

**HW:**

* Build data pipeline scripts for fetching and cleaning
* Document your data pipeline \+ sample queries

**Weeks 4–5: Unsupervised Learning – Clustering Users & Stocks**

* Introduce clustering techniques (K-Means, DBSCAN, Hierarchical Clustering)

* Segment users by spending habits or investment behavior
* Cluster stocks based on performance, volatility, or fundamentals
* Visualize clusters to find patterns (e.g., spending types, high-risk stocks)
* Use PCA/t-SNE to reduce dimensions for plotting

**References:**

* scikit-learn documentation
* Visualizations with matplotlib or seaborn

**HW:**

* Run and compare at least 2 clustering techniques
* Present one insight from your clustering experiments

**Weeks 6–7: Predictive Modeling – Stock Scoring & Budget Forecasting**

* Build and tune ML models for:
  * Stock scoring (regression/classification)
  * Budget forecasting (time-series)
* Integrate clusters into your model as additional features
* Explore models like XGBoost, RandomForest, and Prophet
* Evaluate model performance with proper metrics (RMSE, R², F1, etc.)

**References:**

* XGBoost and Prophet documentation
* sklearn model evaluation guide

**HW:**

* Train and evaluate a stock score model or budget predictor
* Document and share your model’s strengths/weaknesses

**Weeks 8–9: Frontend Integration & AI Assistant**

* Map out frontend flow: stock insights page, budgeting dashboard, chatbot interface
* Connect frontend to cleaned data and model outputs
* Build or test the RAG assistant using LangChain \+ ChromaDB/FAISS
* Create UI components for:

  * Stock score cards
  * Spending categories
  * AI chat interface (React/Next.js)

**References:**

* React/Next.js docs
* LangChain tutorials
* Gemini/OpenAI API docs

**HW:**

* Push a working prototype of at least one full feature (e.g., chatbot, stock explorer

###

**Weeks 10–11: Final Touches & Presentation**

* Finalize model performance \+ frontend polish
* Team sync on who presents what section (data, modeling, frontend, RAG, etc.)
* Design slides with visuals of the platform and insights
* Rehearse without mentor assistance

**HW:**

* Final presentation deck
* Practice demo walkthrough
* Submit code/docs for review
