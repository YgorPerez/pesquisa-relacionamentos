#!/usr/bin/env python3
"""Download the local source for each DOI in a list, from legal copies only.

Looks up every known open copy (published version, accepted manuscript,
preprint) in Unpaywall, OpenAlex and Semantic Scholar, and saves the first
one that is an actual PDF to sources/private/<slug>.pdf.

Usage:
    python3 -I scripts/fetch-sources.py list.txt
    python3 -I scripts/fetch-sources.py - < list.txt

Each line of the list: "<doi> <slug>". Without a slug, the name comes from
the DOI. Blank lines and lines starting with # are skipped.

Unpaywall asks for a contact email: set UNPAYWALL_EMAIL in the environment.
"""

import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET_DIR = ROOT / "fontes" / "privado"
EMAIL = os.environ.get("UNPAYWALL_EMAIL", "unpaywall@example.org")
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) temestudo-sources/1.0"


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def fetch_json(url):
    try:
        return json.loads(fetch(url))
    except Exception:
        return None


def candidates(doi):
    q = urllib.parse.quote(doi)
    urls = []

    j = fetch_json(f"https://api.unpaywall.org/v2/{q}?email={EMAIL}")
    for loc in (j or {}).get("oa_locations") or []:
        urls += [("unpaywall", loc.get("url_for_pdf")), ("unpaywall", loc.get("url"))]

    j = fetch_json(f"https://api.openalex.org/works/https://doi.org/{q}")
    for loc in (j or {}).get("locations") or []:
        urls += [("openalex", loc.get("pdf_url")), ("openalex", loc.get("landing_page_url"))]

    j = fetch_json(f"https://api.semanticscholar.org/graph/v1/paper/DOI:{q}?fields=openAccessPdf")
    urls.append(("semanticscholar", ((j or {}).get("openAccessPdf") or {}).get("url")))

    seen, result = set(), []
    for origin, u in urls:
        if u and u not in seen:
            seen.add(u)
            result.append((origin, u))
    return result


def pdf_from_page(html, base):
    """The citation_pdf_url meta tag that repositories and publishers put on the page."""
    text = html.decode("utf-8", "replace")
    for m in re.finditer(r"<meta[^>]+>", text, re.I):
        tag = m.group(0)
        if re.search(r"name=[\"']citation_pdf_url[\"']", tag, re.I):
            c = re.search(r"content=[\"']([^\"']+)", tag, re.I)
            if c:
                return urllib.parse.urljoin(base, c.group(1))
    return None


def slug_from_doi(doi):
    return re.sub(r"[^a-z0-9]+", "-", doi.lower()).strip("-")


def download(doi, slug):
    target = TARGET_DIR / f"{slug}.pdf"
    if target.exists():
        return f"already exists {target.relative_to(ROOT)}"
    for origin, url in candidates(doi):
        try:
            data = fetch(url, timeout=60)
        except Exception:
            continue
        if data[:5] != b"%PDF-":
            url = pdf_from_page(data, url)
            if not url:
                continue
            try:
                data = fetch(url, timeout=60)
            except Exception:
                continue
        if data[:5] == b"%PDF-":
            target.write_bytes(data)
            return f"OK {target.relative_to(ROOT)} ({origin}: {url})"
    return "no open copy: ask the author or a library, or buy it"


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    source = sys.stdin if sys.argv[1] == "-" else open(sys.argv[1], encoding="utf-8")
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    missing = 0
    for line in source:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        doi = re.sub(r"^https?://(dx\.)?doi\.org/", "", parts[0])
        slug = parts[1] if len(parts) > 1 else slug_from_doi(doi)
        result = download(doi, slug)
        missing += result.startswith("no open copy")
        print(f"{doi}  {result}")
    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    main()
