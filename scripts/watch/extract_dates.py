#!/usr/bin/env python3
"""
Tries to read a specific application-deadline or exam date off each official
portal that has an `examId` in sources.json, and — if what it finds differs
from data/key-dates.json — stages the change for a human to review, instead
of publishing it straight to the live site.

This never writes data/key-dates.json directly. It writes:
  - data/key-dates.proposed.json: what key-dates.json would become if every
    staged proposal were accepted (the file a reviewer can diff against).
  - data/pending-date-changes.json: the list of individual proposals, each
    with the source excerpt it was read from, so a human can sanity-check
    it in seconds rather than trusting the regex.

The calling workflow (.github/workflows/watch.yml) opens a pull request
from these files when pending-date-changes.json is non-empty; merging that
PR is what actually updates data/key-dates.json and makes the new date go
live on the site. Nothing here ever pushes to main directly.

Like check.py, this was written defensively (per-source try/except,
timeouts, conservative matching that would rather miss an update than
propose a wrong one) because it was authored without live network access
to the real portals — the Actions runner is the first place it actually
fetches them.
"""
import os
import re
import sys
import json
import hashlib
import urllib.request
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check import fetch, extract_lines  # reuse the same fetch/text-extraction as the page watcher

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCES_PATH = os.path.join(os.path.dirname(__file__), "sources.json")
KEY_DATES_PATH = os.path.join(ROOT, "data", "key-dates.json")
PROPOSED_PATH = os.path.join(ROOT, "data", "key-dates.proposed.json")
PENDING_PATH = os.path.join(ROOT, "data", "pending-date-changes.json")

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
}
# "10 Nov 2026", "10 November 2026", "10th Nov 2026" — day, month name, 4-digit year.
# A year is required: dateless/yearless mentions are exactly the low-confidence
# case this script should stay quiet about rather than guess at.
DATE_RE = re.compile(
    r"\b(\d{1,2})(?:st|nd|rd|th)?\s+("
    + "|".join(MONTHS.keys())
    + r")[a-z]*\.?\s*,?\s*(20\d{2})\b",
    re.I,
)
DEADLINE_KEYWORDS = (
    "last date", "closing date", "closes on", "close on", "apply by",
    "extended to", "extended up to", "extended till", "registration will close",
    "application window", "last day to apply",
)
EXAM_DATE_KEYWORDS = (
    "exam date", "examination will be held", "exam will be held",
    "test date", "date of examination", "will be conducted on",
)

IST_SUFFIX = "T23:59:00+05:30"  # deadlines are end-of-day IST unless the page says otherwise


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_json(path, default):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def parse_date(day, mon_name, year):
    mon = MONTHS.get(mon_name.lower()[:4]) or MONTHS.get(mon_name.lower()[:3])
    if not mon:
        return None
    try:
        d = datetime(int(year), mon, int(day))
    except ValueError:
        return None
    return d.strftime("%Y-%m-%d")


def find_candidate(lines, keywords):
    """Return (iso_date, excerpt) for the first line that pairs a deadline/exam
    keyword with an unambiguous dated mention, or None if nothing qualifies."""
    for line in lines:
        low = line.lower()
        if not any(k in low for k in keywords):
            continue
        m = DATE_RE.search(line)
        if not m:
            continue
        iso = parse_date(m.group(1), m.group(2), m.group(3))
        if not iso:
            continue
        return iso, line[:300]
    return None


def main():
    sources = [s for s in load_json(SOURCES_PATH, []) if s.get("examId")]
    registry = load_json(KEY_DATES_PATH, {"lastReviewed": None, "exams": {}})
    proposed = json.loads(json.dumps(registry))  # deep copy to mutate
    pending = []
    ts = now_iso()

    for src in sources:
        exam_id = src["examId"]
        try:
            raw = fetch(src["url"])
            lines = extract_lines(raw)
        except Exception as e:
            print(f"  skip {src['name']}: fetch failed ({str(e)[:120]})")
            continue

        current = registry.get("exams", {}).get(exam_id, {})
        found_any = False

        close = find_candidate(lines, DEADLINE_KEYWORDS)
        if close:
            iso_date, excerpt = close
            new_applyclose = iso_date + IST_SUFFIX
            if current.get("applyClose") != new_applyclose:
                pending.append({
                    "id": hashlib.sha1(f"{exam_id}|applyClose|{new_applyclose}".encode()).hexdigest()[:10],
                    "examId": exam_id,
                    "field": "applyClose",
                    "oldValue": current.get("applyClose"),
                    "newValue": new_applyclose,
                    "excerpt": excerpt,
                    "source": src["url"],
                    "sourceName": src["name"],
                    "foundAt": ts,
                })
                proposed.setdefault("exams", {}).setdefault(exam_id, dict(current))
                proposed["exams"][exam_id]["applyClose"] = new_applyclose
                proposed["exams"][exam_id]["status"] = "confirmed"
                proposed["exams"][exam_id]["verifiedOn"] = ts
                proposed["exams"][exam_id]["source"] = src["url"]
                found_any = True

        exam_date = find_candidate(lines, EXAM_DATE_KEYWORDS)
        if exam_date:
            iso_date, excerpt = exam_date
            if current.get("examDate") != iso_date:
                pending.append({
                    "id": hashlib.sha1(f"{exam_id}|examDate|{iso_date}".encode()).hexdigest()[:10],
                    "examId": exam_id,
                    "field": "examDate",
                    "oldValue": current.get("examDate"),
                    "newValue": iso_date,
                    "excerpt": excerpt,
                    "source": src["url"],
                    "sourceName": src["name"],
                    "foundAt": ts,
                })
                proposed.setdefault("exams", {}).setdefault(exam_id, dict(current))
                proposed["exams"][exam_id]["examDate"] = iso_date
                proposed["exams"][exam_id]["verifiedOn"] = ts
                proposed["exams"][exam_id]["source"] = src["url"]
                found_any = True

        print(f"  {src['name']}: {'candidate date found' if found_any else 'no confident date found'}")

    if pending:
        proposed["lastReviewed"] = ts
    save_json(PROPOSED_PATH, proposed)
    save_json(PENDING_PATH, pending)

    print(f"checked {len(sources)} date-mapped sources: {len(pending)} proposed change(s)")
    for p in pending:
        print(f"  PROPOSE: {p['examId']}.{p['field']}: {p['oldValue']} -> {p['newValue']}  (from {p['sourceName']})")


if __name__ == "__main__":
    main()
