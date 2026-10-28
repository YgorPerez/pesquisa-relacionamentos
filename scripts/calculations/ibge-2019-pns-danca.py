"""Sex composition among PNS 2019 respondents naming dance as main exercise.

Python standard library only. From the repository root:
    python3 scripts/calculations/ibge-2019-pns-danca.py
    python3 scripts/calculations/ibge-2019-pns-danca.py extract /path/PNS_2019_20220525.zip

Extract checks the official archive's SHA256 and saves PSU sufficient statistics,
not individual records. Positions are one-based in the official 2022 dictionary
and SAS input: V0024=3:9, UPA_PNS=10:18, C006=108, C008=117:119,
P036=679:680, V00291=1426:1439. Dance is P036=16; sex 1=man, 2=woman.
The calibrated selected-person weight V00291 is used, never household V00281.

Ratio estimate p=sum(w*d*f)/sum(w*d). Taylor linearization: PSU residual
u_hi=(female_total_hi-p*dance_total_hi)/dance_total. Variance is the sum
over strata of n_h/(n_h-1)*sum((u_hi-mean_h(u))**2). All selected-person
PSUs remain, including those with no dancers (domain analysis). This is the
ultimate-cluster, with-replacement approximation without FPC. Singleton
strata cause failure rather than being silently discarded. The two-sided
95% Wald interval uses the standard normal quantile, not an SRS binomial SE.
Calibration uncertainty is not separately modelled. No claim of IBGE tabulation.
"""

import csv
import hashlib
import math
import sys
import zipfile
from collections import defaultdict
from pathlib import Path
from statistics import NormalDist

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "sources/ibge-2019-pns-danca-psu.csv"
SHA256 = "a789f6b0cbf6057111939fb3d1fe62ad1d5e848ba9c1f7860d7b44daa4be6057"


def extract(archive):
    with open(archive, "rb") as f:
        checksum = hashlib.file_digest(f, "sha256").hexdigest()
    if checksum != SHA256:
        raise ValueError("Unexpected microdata archive checksum")
    psus = defaultdict(lambda: [0, 0, 0, 0.0, 0.0])
    with zipfile.ZipFile(archive) as z, z.open("PNS_2019.txt") as f:
        for row in f:
            weight = float(row[1425:1439].strip() or 0)
            if weight <= 0:
                continue
            assert int(row[116:119]) >= 15
            key = (row[2:9].decode(), row[9:18].decode())
            cell = psus[key]
            cell[0] += 1
            if row[678:680] == b"16":
                assert row[107:108] in (b"1", b"2")
                sex = int(row[107:108])
                cell[sex] += 1
                cell[sex + 2] += weight
    with SOURCE.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["stratum", "psu", "selected_n", "men_n", "women_n", "men_weight", "women_weight"])
        for key, cell in sorted(psus.items()):
            writer.writerow([*key, *cell])


def calculate():
    with SOURCE.open() as f:
        rows = list(csv.DictReader(f))
    total = math.fsum(float(r["men_weight"]) + float(r["women_weight"]) for r in rows)
    female = math.fsum(float(r["women_weight"]) for r in rows)
    p = female / total
    strata = defaultdict(list)
    for r in rows:
        d = float(r["men_weight"]) + float(r["women_weight"])
        strata[r["stratum"]].append((float(r["women_weight"]) - p * d) / total)
    terms = []
    for values in strata.values():
        n = len(values)
        if n < 2:
            raise ValueError("Singleton stratum: an explicit variance policy is required")
        mean = math.fsum(values) / n
        terms.append(n / (n - 1) * math.fsum((v - mean) ** 2 for v in values))
    se = math.sqrt(math.fsum(terms))
    margin = NormalDist().inv_cdf(0.975) * se
    print(f"Selected respondents: {sum(int(r['selected_n']) for r in rows)}")
    print(f"PSUs: {len(rows)}; strata: {len(strata)}; design df: {len(rows) - len(strata)}")
    print(f"Dance respondents: {sum(int(r['men_n']) + int(r['women_n']) for r in rows)}")
    print(f"Men n: {sum(int(r['men_n']) for r in rows)}; women n: {sum(int(r['women_n']) for r in rows)}")
    print(f"Weighted dance total: {total:.8f}; women: {female:.8f}")
    print(f"SE (percentage points): {100 * se:.6f}")
    for name, share in [("Mulheres", p), ("Homens", 1 - p)]:
        print(f"{name}: {100 * share:.1f}%; IC 95% {100 * (share - margin):.1f}% a {100 * (share + margin):.1f}%".replace(".", ","))


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "extract":
        extract(sys.argv[2])
    elif len(sys.argv) != 1:
        sys.exit("usage: ibge-2019-pns-danca.py [extract /path/archive.zip]")
    calculate()
