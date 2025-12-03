import utils as newImp
from news_feeds import ingest_all_feeds

def run_scrape_and_push():
    # scrape from Finnhub, fetch full text, classify with FinBERT, upsert into Supabase
    newImp.articleToSupabase()

    # scrape from RSS feeds (BusinessWire, PR Newswire, etc.), fetch full text, classify with FinBERT, upsert into Supabase
    ingest_all_feeds()

    # sanity check Supabase row counts
    newImp.quick_dbcheck()

if __name__ == "__main__":
    run_scrape_and_push()
