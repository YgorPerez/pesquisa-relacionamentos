"""Unweighted numbers from the Kowal et al. (2025) public dataset.

Reads `Dataset_Relationship_Formation.csv` from the OSF project
(https://osf.io/uzf37, file https://osf.io/download/qrf76/), saved in the
private sources. One row per partnered respondent (6,646 rows). Plain means
and shares, without weights and without a test: they are not numbers the
authors published.

    python3 scripts/calculations/kowal-2025-50-paises.py total
        respondents and share who met their partner online, all countries
    python3 scripts/calculations/kowal-2025-50-paises.py country Brazil
        respondents, met online (count and share) and mean satisfaction,
        intimacy, passion and commitment, online and offline
    python3 scripts/calculations/kowal-2025-50-paises.py since2010 Brazil
        relationships begun in 2010 or later (2024 minus the relationship
        length, as in section 2.4 of the article): online count, total, share
    python3 scripts/calculations/kowal-2025-50-paises.py rank Brazil
        the country's place among the 50 by share online, and the share
    python3 scripts/calculations/kowal-2025-50-paises.py gap
        relationships begun in 2010 or later, all countries: offline mean
        minus online mean of each scale, and that gap divided by the scale's
        standard deviation in the subset (a raw standardized difference,
        without covariates, nesting or weights)
"""

import csv
import statistics
import sys
from pathlib import Path

# From the repository root, wherever the script is run from.
ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "sources/private/kowal-2025-50-paises-data.csv"
USAGE = "usage: total | gap | country <name> | since2010 <name> | rank <name>"
COUNTRY_MODES = ("country", "since2010", "rank")
SCALES = ["Relationship_satisfaction", "Intimacy", "Passion", "Commitment"]


def rows():
    with open(SOURCE, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter=";"))


def online(r):
    return r["Relationship_met_recoded"] == "Online"


def since2010(r):
    # Section 2.4: start year = 2024 (data collection) minus the relationship length.
    return 2024 - float(r["Relationship_length_1yearto1"]) >= 2010


def share(part, whole):
    return 100 * len(part) / len(whole)


def mean(values):
    return sum(values) / len(values)


def by_country(data):
    countries = {}
    for r in data:
        countries.setdefault(r["Country_live_HK_factor"], []).append(r)
    return countries


def main(mode=None, country=None, *extra):
    if extra or mode not in ("total", "gap", *COUNTRY_MODES) or (mode in COUNTRY_MODES) != (country is not None):
        sys.exit(USAGE)
    data = rows()
    if mode == "total":
        on = [r for r in data if online(r)]
        print(f"{len(data)} respondents, {len(on)} online ({share(on, data):.1f}%)")
        return
    if mode == "gap":
        recent = [r for r in data if since2010(r)]
        on = [r for r in recent if online(r)]
        off = [r for r in recent if not online(r)]
        print(f"begun 2010 or later: {len(on)} online, {len(off)} offline")
        for scale in SCALES:
            gap = mean([float(r[scale]) for r in off]) - mean([float(r[scale]) for r in on])
            sd = statistics.pstdev([float(r[scale]) for r in recent])
            print(f"{scale}: gap {gap:.2f}, standardized {gap / sd:.2f}")
        return
    countries = by_country(data)
    if country not in countries:
        sys.exit(f"no respondents from {country!r}; the countries are: {', '.join(sorted(countries))}")
    if mode == "rank":
        ranked = sorted(
            countries, key=lambda c: share([r for r in countries[c] if online(r)], countries[c]), reverse=True
        )
        group = countries[country]
        on = [r for r in group if online(r)]
        print(f"{country}: {ranked.index(country) + 1} of {len(ranked)}, {share(on, group):.1f}% online")
        return
    group = countries[country]
    if mode == "since2010":
        recent = [r for r in group if since2010(r)]
        on = [r for r in recent if online(r)]
        print(f"{country}, begun 2010 or later: {len(on)} of {len(recent)} online ({share(on, recent):.0f}%)")
        return
    on = [r for r in group if online(r)]
    off = [r for r in group if not online(r)]
    print(f"{country}: {len(group)} respondents, {len(on)} online ({share(on, group):.1f}%), {len(off)} offline")
    for scale in SCALES:
        a = mean([float(r[scale]) for r in on])
        b = mean([float(r[scale]) for r in off])
        print(f"{scale}: online {a:.2f}, offline {b:.2f}")


if __name__ == "__main__":
    main(*sys.argv[1:])
