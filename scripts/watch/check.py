#!/usr/bin/env python3
"""
Watches the official exam portals listed in sources.json for text changes
and writes anything new into data/notifications.json for the site to show
under Notifications, with a "last checked" timestamp.

Runs as a scheduled GitHub Action (.github/workflows/watch.yml). Network
access here is whatever the Actions runner has (the open internet), not
the restricted sandbox this was written in — this script was not run end
to end at authoring time; it is written defensively (per-source try/except,
timeouts, generous fallbacks) so one bad source never breaks the run.

How it works, per source:
 1. Fetch the page, strip scripts/styles/tags down to visible text lines.
 2. Compare those lines to the ones saved from the previous run.
 3. Lines that are new (and weren't just a reorder of old ones) become
    candidate notifications. If a huge chunk of the page changed at once
    (a redesign, not a new notice), file one generic "page changed" item
    instead of flooding the feed.
 4. Save the new line snapshot for next time, regardless of outcome.

First run for a source only establishes a baseline (nothing to compare
against yet), so it never dumps the whole page as "new".
"""
import os, re, sys, json, html, hashlib, urllib.request, urllib.error
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCES_PATH = os.path.join(os.path.dirname(__file__), "sources.json")
SNAP_DIR = os.path.join(ROOT, "data", "watch-snapshots")
OUT_PATH = os.path.join(ROOT, "data", "notifications.json")

UA = "Mozilla/5.0 (compatible; BeyondJEEWatch/1.0; +https://github.com/kevalbuch/Beyond-JEE)"
TIMEOUT = 25
MAX_ITEMS = 60
MAX_NEW_PER_SOURCE = 8
MIN_LINE_LEN = 20
BOILERPLATE = (
    "copyright", "all rights reserved", "powered by", "best viewed",
    "privacy policy", "terms of use", "visitor count", "last updated on",
    "disclaimer:", "designed and developed",
)


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-IN,en;q=0.8"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        charset = r.headers.get_content_charset() or "utf-8"
        return r.read().decode(charset, errors="ignore")


def extract_lines(raw_html):
    text = re.sub(r"(?is)<(script|style|noscript)\b.*?</\1>", " ", raw_html)
    text = re.sub(r"(?is)<(br|p|div|li|tr|h[1-6])\b[^>]*>", "\n", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = html.unescape(text)
    lines = []
    seen = set()
    for raw in text.split("\n"):
        line = re.sub(r"\s+", " ", raw).strip(" \t -|·•")
        if len(line) < MIN_LINE_LEN:
            continue
        low = line.lower()
        if any(b in low for b in BOILERPLATE):
            continue
        if line not in seen:
            seen.add(line)
            lines.append(line)
    return lines[:400]


def load_json(path, default):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=0, separators=(",", ":"))


def mk_item(src, ts, title):
    key = (src["id"] + "|" + title).encode("utf-8")
    return {
        "id": hashlib.sha1(key + ts.encode()).hexdigest()[:12],
        "time": ts,
        "source": src["name"],
        "cat": src.get("cat", ""),
        "url": src["url"],
        "title": title[:220],
    }


def is_dup(item, existing):
    for e in existing[:150]:
        if e.get("source") == item["source"] and e.get("title") == item["title"]:
            return True
    return False


def main():
    sources = load_json(SOURCES_PATH, [])
    prior = load_json(OUT_PATH, {"items": []})
    existing_items = prior.get("items", [])

    ts = now_iso()
    new_items = []
    ok = 0
    failed = []

    for src in sources:
        snap_path = os.path.join(SNAP_DIR, src["id"] + ".json")
        try:
            raw = fetch(src["url"])
            lines = extract_lines(raw)
            prev = load_json(snap_path, {"lines": []})
            prev_lines = prev.get("lines", [])
            prev_set = set(prev_lines)
            new_only = [l for l in lines if l not in prev_set]

            if prev_lines:  # skip the very first run (no baseline yet)
                if len(new_only) > MAX_NEW_PER_SOURCE:
                    candidates = [mk_item(src, ts, "This page changed — open it to see what's new.")]
                else:
                    candidates = [mk_item(src, ts, l) for l in new_only[:MAX_NEW_PER_SOURCE]]
                for it in candidates:
                    if not is_dup(it, existing_items + new_items):
                        new_items.append(it)

            save_json(snap_path, {"lines": lines, "checked": ts})
            ok += 1
        except Exception as e:
            failed.append({"source": src["name"], "error": str(e)[:200]})

    items = (new_items + existing_items)[:MAX_ITEMS]
    out = {
        "lastChecked": ts,
        "stats": {"ok": ok, "failed": len(failed), "total": len(sources), "new": len(new_items)},
        "failedSources": [f["source"] for f in failed],
        "items": items,
    }
    save_json(OUT_PATH, out)

    print(f"checked {len(sources)} sources: {ok} ok, {len(failed)} failed, {len(new_items)} new item(s)")
    for f in failed:
        print(f"  failed: {f['source']}: {f['error']}")
    for it in new_items:
        print(f"  new: [{it['source']}] {it['title']}")


if __name__ == "__main__":
    main()
