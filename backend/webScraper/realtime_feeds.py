#This file is meant to be for pulling the feed from the SEC filings feed

# realtime_feeds.py

import time
import hashlib
import requests
import feedparser
from datetime import datetime, timezone

# We import from your utils.py so we reuse scraping, sentiment, DB insert
from utils import get_fulltext, insert_into_supabase

SEC_FEED_URL = (
    "https://www.sec.gov/cgi-bin/browse-edgar"
    "?action=getcurrent&type=&company=&dateb=&owner=include"
    "&start=0&count=100&output=atom"
)

# We'll keep a tiny in-memory cache of seen IDs so we don't spam insert
SEEN = set()

def gen_id_from(text: str) -> str:
    """Make a stable ID for this item that we can reuse as article_db['id']."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

def fetch_sec_feed():
    """Pull the SEC Atom feed and return parsed entries."""
    headers = {
        # SEC asks for a descriptive UA when hitting EDGAR programmatically.
        # In production: include your email or project name.
        "User-Agent": "FundThesis Research (contact: your-email@example.com)",
        "Accept": "application/atom+xml,text/xml",
    }
    resp = requests.get(SEC_FEED_URL, headers=headers, timeout=10)
    resp.raise_for_status()
    return feedparser.parse(resp.text)

def normalize_sec_entry(entry: dict) -> dict:
    """
    Take one SEC Atom entry from feedparser and convert to our 'article_db' dict.
    We'll try to fill: id, headline, summary, datetime, related, source, url.
    """
    # Typical SEC fields in Atom:
    # entry.title            -> "8-K - NVIDIA CORPORATION (0001045810) (Filer)"
    # entry.link             -> filing URL
    # entry.published        -> "2025-10-27T13:25:00-04:00"
    # entry.summary          -> HTML snippet that includes form type etc.
    # entry.cik or entry.id  -> sometimes appears

    headline = entry.get("title", "").strip()
    url = entry.get("link", "").strip()
    published_raw = entry.get("published", "")  # we'll convert to ISO Z

    # convert published_raw to UTC ISO string if possible
    published_iso = None
    try:
        # feedparser gives RFC3339-ish w/ offset, e.g. "2025-10-27T13:25:00-04:00"
        dt = datetime.fromisoformat(
            published_raw
            .replace("Z", "+00:00")  # normalize if ends with Z
        )
        published_iso = dt.astimezone(timezone.utc).isoformat()
    except Exception:
        published_iso = None

    # SEC form type often first token in title
    # ex "8-K - NVIDIA CORPORATION (0001045810) (Filer)"
    form_type = headline.split(" - ")[0] if " - " in headline else None

    # Try to extract CIK from title e.g. "(0001045810)"
    cik = None
    m = None
    import re
    m = re.search(r"\(([0-9]{10})\)", headline)
    if m:
        cik = m.group(1)

    # We'll pack ticker mapping later (CIK->ticker table).
    # For now "related" can just be CIK so you can later join to ticker
    related = cik

    # We make a deterministic id using link + published time
    local_id = gen_id_from(url + (published_iso or ""))

    article_db = {
        "id": local_id,
        "headline": headline,
        "summary": form_type or headline,
        "datetime": published_iso or None,  # utils.insert_into_supabase can handle ISO-ish
        "category": form_type,              # treat filing type as category
        "related": related,                 # this can be turned into tickers later
        "source": "SEC",
        "url": url,
    }
    return article_db

def ingest_sec_once():
    """
    Fetch the SEC feed, loop new items, scrape + insert into Supabase.
    """
    feed = fetch_sec_feed()

    new_count = 0
    for entry in feed.entries:
        article_db = normalize_sec_entry(entry)

        # skip if we've already seen this in this session
        if article_db["id"] in SEEN:
            continue
        SEEN.add(article_db["id"])

        # get full text of filing URL using your existing scraper
        text, status, error, http_status, meta = get_fulltext(article_db["url"])

        # insert into Supabase with sentiment and metadata
        insert_into_supabase(
            article_db=article_db,
            text=text,
            status=status,
            error=error,
            http_status=http_status,
            meta=meta
        )

        new_count += 1

    print(f"[SEC] Inserted {new_count} new filings")

if __name__ == "__main__":
    # super basic poller: hit SEC every ~2-3 min
    # in production you'd run this in a loop with asyncio or a cron
    while True:
        try:
            ingest_sec_once()
        except Exception as e:
            print("Error in SEC ingest:", e)
        time.sleep(120)  # 2 minutes
