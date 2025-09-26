#This is the file with the original code that I made by myself.
import os
import finnhub
from datetime import date, timedelta
import sqlite3
from pathlib import Path
from newspaper import Article
from dotenv import load_dotenv



load_dotenv()
API_KEY = os.getenv("FINNHUB_KEY")


#This is to set up the client(idk what that really means)
def finn_client():
    finnhub_client = finnhub.Client(api_key=API_KEY)
    global news
    news = finnhub_client.general_news('general', min_id=0)

#This will be where we create the database

def setup_database(db_name):

    global connection 
    connection = sqlite3.connect(f"{db_name}.db")

    global cursor 
    cursor = connection.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS articles(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER,
        category TEXT, 
        datetime INTEGER,
        headline TEXT,
        related TEXT,
        source TEXT, 
        summary TEXT,
        full_text TEXT,
        url TEXT,
        inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''
    )

    cursor.execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_article_id
    ON articles(article_id)
    """)


#This just prints the stuff out
count = 1

def get_fulltext(sing_article):
    url = sing_article['url']
    entire_text = None
    try:
        specArticle = Article(url)
        specArticle.download()
        specArticle.parse()
        entire_text = specArticle.text
        return entire_text
    except Exception:
        return entire_text

def insert_intoDB(article_db, ent_text):
    cursor.execute("INSERT OR IGNORE INTO articles " \
                        "(article_id, category, datetime, headline, related," \
                        "source, summary, full_text, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                        (article_db['id'], article_db['category'],article_db['datetime'],
                        article_db['headline'],article_db['related'],article_db['source'],
                        article_db['summary'], ent_text, article_db['url']))

#This is the only function for the whole insertion part that will show up
#in the main file
def articleToDB():
    finn_client()
    for article in news:
        full_text = get_fulltext(article)
        insert_intoDB(article, full_text)
    connection.commit()

def quick_dbcheck():
    cursor.execute("SELECT COUNT(*) FROM articles")
    print("Total rows in articles:", cursor.fetchone()[0])

def text_empty():
    """

    if the full_text = None
        pull the url from the database
        
    """
