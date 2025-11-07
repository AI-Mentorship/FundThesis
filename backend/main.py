from fastapi import FastAPI
from app.routes import router

app = FastAPI()

app.include_router(router)


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


