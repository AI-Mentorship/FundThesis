#This is the newscraper functions that Im testing out to see if I can get more optimal scraping 

import os
import time
import sqlite3
from urllib.parse import urlparse, urljoin
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from readability import Document
import re


import requests
from requests.adapters import HTTPAdapter, Retry

# Fallback extractors
import trafilatura
from newspaper import Article
from readability import Document

import finnhub

#FinBERT setup
# Use a pipeline as a high-level helper
from transformers import pipeline
pipe = pipeline("text-classification", model="ProsusAI/finbert")



MIN_WORDS = 150

load_dotenv()
API_KEY = os.getenv("FINNHUB_KEY")

# ---------- HTTP session with headers & retries ----------
def make_session():
    s = requests.Session()
    s.headers.update({
        # A common current desktop UA string
        "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36"),
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Connection": "keep-alive",
    })
    retries = Retry(
        total=3,
        backoff_factor=0.6,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset(["GET", "HEAD"])
    )
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.mount("http://", HTTPAdapter(max_retries=retries))
    return s

SESSION = make_session()

# ---------- Finnhub ----------
def finn_client():
    if not API_KEY:
        raise RuntimeError("FINNHUB_KEY not set in env")
    return finnhub.Client(api_key=API_KEY)

# ---------- Database ----------
def setup_database(db_name: str):
    global connection, cursor
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # goes up from webscraper to backend
    DB_PATH = os.path.join(BASE_DIR, "db", "NewsArticles.db")

    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()
    cursor.execute("""
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
        label TEXT,
        inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_article_id
    ON articles(article_id)
    """)
    # Optional aux columns for reliability/debug (ignore if they exist)
    try:
        cursor.execute("ALTER TABLE articles ADD COLUMN fetch_status TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE articles ADD COLUMN fetch_error TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE articles ADD COLUMN source_domain TEXT")
    except sqlite3.OperationalError:
        pass
    connection.commit()

# ---------- Extractors ----------
def extract_trafilatura(html: str) -> str | None:
    # Trafilatura ignores robots by default; yields clean text
    txt = trafilatura.extract(html, include_tables=False, include_formatting=False)
    return txt.strip() if txt else None

def extract_newspaper(url: str, html: str | None) -> str | None:
    try:
        art = Article(url)
        if html:
            art.download(html=html)
        else:
            art.download()
        art.parse()
        return art.text.strip() if art.text else None
    except Exception:
        return None

def extract_readability(html: str) -> str | None:
    try:
        doc = Document(html)
        text = doc.summary(html_partial=True)
        # crude text-only strip; you can keep HTML if you want
        import re
        plain = re.sub("<[^<]+?>", "", text or "").strip()
        return plain or None
    except Exception:
        return None

def fetch_html(url: str) -> tuple[int|None, str|None]:
    try:
        resp = SESSION.get(url, timeout=10)
        return resp.status_code, (resp.text if resp.ok else None)
    except requests.RequestException:
        return None, None

def _canonical_and_amp(html: str, base_url: str) -> tuple[str|None, str|None]:
    """Return (canonical_url, amp_url) if present."""
    try:
        soup = BeautifulSoup(html, "lxml")
        can = soup.find("link", rel=lambda v: v and "canonical" in v.lower())
        amp = soup.find("link", rel=lambda v: v and "amphtml" in v.lower())
        can_url = urljoin(base_url, can["href"]) if can and can.get("href") else None
        amp_url = urljoin(base_url, amp["href"]) if amp and amp.get("href") else None
        return can_url, amp_url
    except Exception:
        return None, None

def _extract_trafilatura(html: str) -> str|None:
    cfg = trafilatura.settings.use_config()
    # Favor recall; allow fallback heuristics
    cfg.set("DEFAULT", "EXTRACTION_TIMEOUT", "0")
    cfg.set("DEFAULT", "MIN_EXTRACTED_SIZE", "0")
    txt = trafilatura.extract(html, config=cfg, include_tables=False, include_formatting=False)
    return txt.strip() if txt else None

def _extract_newspaper(url: str, html: str|None) -> str|None:
    try:
        art = Article(url)
        if html:
            art.download(html=html)
        else:
            art.download()
        art.parse()
        return art.text.strip() if art.text else None
    except Exception:
        return None
    
def _extract_readability(html: str) -> str|None:
    try:
        doc = Document(html)
        # full article HTML, then strip tags but keep paragraph breaks
        html_out = doc.summary()
        text = re.sub(r"<\s*br\s*/?>", "\n", html_out, flags=re.I)
        text = re.sub(r"</p\s*>", "\n\n", text, flags=re.I)
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip() or None
    except Exception:
        return None

def _extract_article_tag(html: str) -> str|None:
    """Last-resort: concatenate all <article> <p> tags."""
    try:
        soup = BeautifulSoup(html, "lxml")
        art = soup.find("article")
        if not art:
            # some sites wrap in role=article or main content div
            art = soup.find(attrs={"role": "article"}) or soup.find("main")
        if not art:
            return None
        parts = [p.get_text(" ", strip=True) for p in art.find_all("p")]
        text = "\n\n".join([p for p in parts if p])
        return text.strip() or None
    except Exception:
        return None

def _fetch_html_following_better_url(url: str) -> tuple[str, str, int|None]:
    """
    Returns (final_url, html, http_status). Tries AMP/canonical if they look better.
    """
    # 1) fetch original
    status, html = fetch_html(url)
    final_url = url
    if not html:
        return final_url, "", status

    # 2) see if there is a better target (prefer AMP first; it’s usually static/full)
    can_url, amp_url = _canonical_and_amp(html, final_url)

    # Pick AMP if same domain and not obviously truncated aggregators
    def _same_domain(u1, u2):
        try:
            return urlparse(u1).netloc.split(":")[0] == urlparse(u2).netloc.split(":")[0]
        except Exception:
            return False

    candidate = None
    if amp_url and (_same_domain(final_url, amp_url) or ("amp." in amp_url)):
        candidate = amp_url
    elif can_url:
        candidate = can_url

    if candidate and candidate != final_url:
        st2, html2 = fetch_html(candidate)
        if html2 and len(html2) > max(len(html)*0.6, 4000):  # crude heuristic: bigger page likely has full text
            return candidate, html2, st2 or status

    return final_url, html, status

def get_fulltext(url: str) -> tuple[str|None, str|None, str|None, int|None, dict]:
    """
    Returns (text, status, error, http_status, meta)
    status: 'ok' | 'empty' | 'blocked' | 'error' | 'short'
    meta: dict with used_extractor, best_url, html_len
    """
    best_url, html, http_status = _fetch_html_following_better_url(url)
    if not html:
        return None, ('blocked' if (http_status and http_status in (401,403)) else 'error'), "no_html", http_status, {"best_url": best_url, "used_extractor": None, "html_len": 0}

    html_len = len(html)

    # Try extractors in order; require a reasonable length
    for name, fn in [
        ("trafilatura", _extract_trafilatura),
        ("newspaper3k", lambda h: _extract_newspaper(best_url, h)),
        ("readability", _extract_readability),
        ("article-tag", _extract_article_tag),
    ]:
        try:
            text = fn(html)
            if text and len(text.split()) >= MIN_WORDS:
                return text, "ok", None, http_status, {"best_url": best_url, "used_extractor": name, "html_len": html_len}
            # If we got something but short, keep it as a candidate; try next method first
            short_candidate = text
        except Exception:
            short_candidate = None
        # keep trying next extractor

    # If all methods “short”, return the longest short candidate
    best = max(
        [(_extract_trafilatura(html) or ""),
         (_extract_newspaper(best_url, html) or ""),
         (_extract_readability(html) or ""),
         (_extract_article_tag(html) or "")],
        key=lambda t: len(t)
    )
    if best:
        status = "short" if len(best.split()) < MIN_WORDS else "ok"
        return best, status, None, http_status, {"best_url": best_url, "used_extractor": "fallback-longest", "html_len": html_len}

    return None, "empty", "extract_failed", http_status, {"best_url": best_url, "used_extractor": None, "html_len": html_len}


# ---------- Insert ----------
def insert_intoDB(article_db: dict, text: str|None, status: str, error: str|None, http_status: int|None, meta: dict):
    finb_summaryinp = article_db.get('summary')
    into_label = run_finbert(finb_summaryinp)
    domain = None
    try:
        domain = urlparse(article_db['url']).netloc
    except Exception:
        pass
    cursor.execute("""
        INSERT OR IGNORE INTO articles
        (article_id, category, datetime, headline, related, source, summary, full_text, url, label, fetch_status, fetch_error, source_domain)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        article_db.get('id'),
        article_db.get('category'),
        article_db.get('datetime'),
        article_db.get('headline'),
        article_db.get('related'),
        article_db.get('source'),
        article_db.get('summary'),
        text,
        meta.get("best_url") or article_db.get('url'),
        into_label,
        f"{status}:{http_status}|{meta.get('used_extractor')}|html={meta.get('html_len')}",
        error,
        domain
    ))


# ---------- Pipeline ----------
def articleToDB(db_name: str = "fundthesis"):
    setup_database(db_name)
    finc = finn_client()
    news = finc.general_news('general', min_id=0)

    inserted = 0
    for art in news:
        text, status, error, http_status, meta = get_fulltext(art['url'])
        insert_intoDB(art, text, status, error, http_status, meta)
        inserted += 1
    connection.commit()
    print(f"Inserted {inserted} articles")

#-------------FinBert-------------
def run_finbert(summ_of_article):
    result = pipe(summ_of_article)
    label = result[0]['label']
    return label


def quick_dbcheck():
    cursor.execute("SELECT COUNT(*), SUM(CASE WHEN full_text IS NULL OR TRIM(full_text)='' THEN 1 ELSE 0 END) FROM articles")
    total, empties = cursor.fetchone()
    print(f"Total rows: {total} | Empty full_text: {empties}")
