import requests
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import numpy as np

url = "https://api.gdeltproject.org/api/v2/doc/doc"
params = {
    "query": "AAPL",
    "mode": "artlist",
    "maxrecords": "250",
    "format": "json",
    "startdatetime": "20230505000000",
    "enddatetime": "20230508000000"
}
response = requests.get(url, params=params).json()
articles = [a['title'] for a in response["articles"]]
#currently only doing titles, change to full article content soon


#computing score

sia = SentimentIntensityAnalyzer()
scores = []
for article_title in articles:
    compound = sia.polarity_scores(article_title)['compound']
    scores.append(compound)

tone_coefficient = np.mean(scores)#gives score for tone for the specified start and end date

