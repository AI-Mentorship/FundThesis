#This is the newscraper functions that Im testing out to see if I can get more optimal scraping 

import os
import time
import sqlite3
from urllib.parse import urlparse, urljoin
from pathlib import Path
from datetime import datetime, timezone
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

#SUPABASE setup
from supabase import create_client, Client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE = os.environ["SUPABASE_SERVICE_ROLE"]  # DO NOT expose this to frontend
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)


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

#Helper for converting epoch to timestamptz string
def epoch_to_iso(epoch_val):
    """Convert UNIX seconds -> ISO string with UTC tzinfo, or None."""
    if epoch_val is None:
        return None
    try:
        ts = int(epoch_val)
        dt = datetime.fromtimestamp(ts, timezone.utc)
        return dt.isoformat()
    except Exception:
        return None




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
#Inserting articles into supabase
def insert_into_supabase(article_db: dict,
                         text: str | None,
                         status: str,
                         error: str | None,
                         http_status: int | None,
                         meta: dict):
    """
    article_db: generic "news item"
    We'll gracefully handle different shapes (Finnhub, SEC, etc.)
    """

    # --- 1. Sentiment source ---
    finb_input = (
        article_db.get('summary')
        or article_db.get('headline')
        or ""
    )
    into_label = run_finbert(finb_input) if finb_input else None

    # --- 2. Domain extraction ---
    try:
        domain = urlparse(article_db.get('url', '')).netloc or None
    except Exception:
        domain = None

    # --- 3. Normalize published_at ---
    published_raw = article_db.get('datetime')
    published_iso = None

    # Case 1: it's epoch-like (e.g. 1698432000)
    if isinstance(published_raw, (int, float)) or (isinstance(published_raw, str) and published_raw.isdigit()):
        published_iso = epoch_to_iso(published_raw)

    # Case 2: it's already ISO-ish string like "2025-10-27T13:12:00+00:00" or "...Z"
    elif isinstance(published_raw, str):
        try:
            dt = datetime.fromisoformat(published_raw.replace("Z", "+00:00"))
            published_iso = dt.astimezone(timezone.utc).isoformat()
        except Exception:
            published_iso = None

    # --- 4. Build payload base ---
    payload = {
        "category": article_db.get('category'),
        "published_at": published_iso,
        "headline": article_db.get('headline'),
        "related": article_db.get('related'),
        "source": article_db.get('source'),
        "summary": article_db.get('summary'),
        "full_text": text,
        "url": meta.get("best_url") or article_db.get('url'),
        "label": into_label,
        "inserted_at": datetime.now(timezone.utc).isoformat(),
        "fetch_status": f"{status}:{http_status}|{meta.get('used_extractor')}|html={meta.get('html_len')}",
        "fetch_error": error,
        "source_domain": domain
    }

    # --- 5. ONLY add sqlite_id/article_id if they look numeric ---
    art_id = article_db.get('id')
    if isinstance(art_id, (int, float)) or (isinstance(art_id, str) and art_id.isdigit()):
        payload["sqlite_id"] = art_id
        payload["article_id"] = art_id
    # else: skip those fields so Postgres doesn't try to coerce

    # --- 6. Upsert ---
    res = supabase.table("articles").upsert(payload, on_conflict="url").execute()
    return res


# ---------- Pipeline ----------
def articleToSupabase():
    finc = finn_client()
    news = finc.general_news('general', min_id=0)

    inserted = 0
    for art in news:
        # get article body by scraping the URL
        text, status, error, http_status, meta = get_fulltext(art['url'])

        # push 1 row into Supabase
        insert_into_supabase(
            article_db=art,
            text=text,
            status=status,
            error=error,
            http_status=http_status,
            meta=meta
        )

        inserted += 1

    print(f"Inserted {inserted} articles into Supabase")


#-------------FinBert-------------
def run_finbert(summ_of_article):
    result = pipe(summ_of_article)
    label = result[0]['label']
    return label


def quick_dbcheck():
    # total rows
    total_res = supabase.table("articles").select("id").execute()
    total_rows = len(total_res.data)

    # rows with missing/blank full_text
    empty_res = supabase.table("articles") \
        .select("id, full_text") \
        .or_("full_text.is.null,full_text.eq.") \
        .execute()
    empty_rows = len(empty_res.data)

    print(f"Total rows in Supabase: {total_rows} | Empty full_text: {empty_rows}")


