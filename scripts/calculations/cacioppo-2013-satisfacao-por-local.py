"""Numbers from Cacioppo et al. (2013) Dataset S1, weighted with `wts`.

Reads the PNAS supplement spreadsheet (one row per respondent, 19,131 rows)
from the private sources with the standard library only. `wts` is the Harris
propensity weight: it sums to the 19,038 of Table S1 and reproduces the
article's 5.96% vs. 7.67% break-ups and 5.64 vs. 5.48 satisfaction.

    python3 scripts/calculations/cacioppo-2013-satisfacao-por-local.py online
        weighted percent who met their spouse online (Fig. 1B)
    python3 scripts/calculations/cacioppo-2013-satisfacao-por-local.py duration
        weighted mean years of marriage, all and for the currently married,
        online and offline. `Days_in_Relationship_All` counts from the first
        day of the wedding month to July 1, 2012, or to the divorce
        (Appendix S1 codebook); the widowed have no value.
"""

import re
import sys
import zipfile
import xml.etree.ElementTree as ET

SOURCE = "sources/private/cacioppo-2013-satisfacao-por-local-dataset-s1.xlsx"
M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
WANTED = ["wts", "Q700A1", "Married", "Days_in_Relationship_All"]


def column(ref):
    n = 0
    for ch in re.match(r"[A-Z]+", ref).group(0):
        n = n * 26 + ord(ch) - 64
    return n - 1


def read_rows():
    with zipfile.ZipFile(SOURCE) as z:
        shared = [
            "".join(t.text or "" for t in si.iter(M + "t"))
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(M + "si")
        ]
        header = None
        index = {}
        with z.open("xl/worksheets/sheet1.xml") as sheet:
            for _, el in ET.iterparse(sheet):
                if el.tag != M + "row":
                    continue
                cells = {}
                for c in el.iter(M + "c"):
                    v = c.find(M + "v")
                    if v is None:
                        continue
                    cells[column(c.get("r"))] = shared[int(v.text)] if c.get("t") == "s" else v.text
                el.clear()
                if header is None:
                    header = cells
                    index = {name: i for i, name in header.items()}
                    continue
                yield {name: cells.get(index[name], "") for name in WANTED}


def number(text):
    try:
        return float(text)
    except ValueError:
        return None


def weighted_mean(rows, key):
    total = weight = 0.0
    for r in rows:
        v = number(r[key])
        if v is None:
            continue
        total += float(r["wts"]) * v
        weight += float(r["wts"])
    return total / weight


rows = list(read_rows())
online = [r for r in rows if r["Q700A1"] == "1"]
offline = [r for r in rows if r["Q700A1"] == "2"]
what = sys.argv[1] if len(sys.argv) > 1 else ""

if what == "online":
    share = sum(float(r["wts"]) for r in online) / sum(float(r["wts"]) for r in rows)
    print(f"{100 * share:.2f}")
elif what == "duration":
    years = lambda rs: weighted_mean(rs, "Days_in_Relationship_All") / 365.25
    married = lambda rs: [r for r in rs if r["Married"] == "1"]
    print(
        f"all {years(rows):.2f}; online {years(online):.2f}; offline {years(offline):.2f}; "
        f"currently married online {years(married(online)):.2f}; offline {years(married(offline)):.2f}"
    )
else:
    sys.exit("usage: cacioppo-2013-satisfacao-por-local.py online|duration")
