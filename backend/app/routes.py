# app/routes.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/home")
def ping():
    return {"message": "pong"}

@router.get("/dashboard")
def read_dashboard():
    return{"Welcome to dashboard"}

@router.get("/roulette")# for the roulette page where 
def gamble():
    return {"Put your life savings into NMAX"}#Put nmax in there cuz it lost most money in the year


