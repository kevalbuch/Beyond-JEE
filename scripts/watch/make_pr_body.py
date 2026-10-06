#!/usr/bin/env python3
"""Renders data/pending-date-changes.json as a Markdown PR body for the
date-review pull request. Kept separate from the workflow YAML so it's
plain, testable Python rather than a shell heredoc."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PENDING_PATH = os.path.join(ROOT, "data", "pending-date-changes.json")


def main():
    with open(PENDING_PATH, "r", encoding="utf-8") as f:
        items = json.load(f)

    print("Automated date check found changes on official exam portals.")
    print("Review each one against its source before merging — **merging this PR is what makes the new date go live on the site.**")
    print()
    for p in items:
        print(f"### `{p['examId']}` — {p['field']}")
        old = p.get("oldValue") or "not previously recorded"
        print(f"- **{old} → {p['newValue']}**")
        print(f"- Source: [{p['sourceName']}]({p['source']})")
        print(f"- Found on the page: \"{p['excerpt']}\"")
        print()


if __name__ == "__main__":
    main()
