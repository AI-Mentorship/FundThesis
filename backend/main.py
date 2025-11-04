from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.news_routes import router as news_router

app = FastAPI()

# Add CORS middleware to allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(news_router)


'''
assuming current DB structure:

ticker (uuid), current_price, %change from most recent open, forecast model prediction (will be in dataframe)

- ASK FRONTEND TEAM HOW THEY ARE PLANNING TO VISUALISE CHARTS
-ASK IF EACH TICKER WILL HAVE THEIR OWN PAGE
- CHECK PLANS FOR DIFFERENT PLATES
- Plan with frontend team to basically ask what they all are doing cause 
'''


@app.get("/")#homepage
def read_root():
    return {"Welcome to fundthesis"}


