# This is the improved testing scraping logic
import newsScraper_Improved as newImp

newImp.articleToDB("NewsArticles")   # just the db_name
newImp.quick_dbcheck()

if __name__ == "__main__":
    # 1) One-shot fetch+extract+insert (uses robust HTML fetch + fallbacks)
    newImp.articleToDB(db_name="NewsArticles", category="general", limit=400)

    # 2) (Optional) Retry any rows that inserted with empty full_text or fetch errors
    #    Useful if some sites throttled you the first pass.
    try:
        newImp.refetch_failures(db_name="NewsArticles", limit=200)
    except AttributeError:
        # If you didn't add refetch_failures yet, you can ignore this.
        pass

    # 3) Quick sanity check
    newImp.quick_dbcheck()
