"""Two-tailed p of each Mann-Whitney U in Lelonkiewicz et al. (2021).

The article says its U tests are one-tailed. This recomputes the p of each
reported U from the group sizes with the normal approximation (no tie
correction, no continuity correction), to show that the published p values
match a two-tailed test. Inputs come from sections 2.2, 2.4, 3.2 and 3.4:
Experiment 1 has 80 imitated and 75 counter-imitated participants,
Experiment 2 has 75 and 72.

    python3 scripts/calculations/lelonkiewicz-2021-imitacao-lexical-nulo.py
"""

import math

TESTS = [
    ("Exp 1 interaction", 3165.5, 80, 75, 0.554),
    ("Exp 1 partner", 2985.5, 80, 75, 0.960),
    ("Exp 1 cooperativeness", 2951, 80, 75, 0.862),
    ("Exp 2 interaction", 2493, 75, 72, 0.423),
    ("Exp 2 partner", 2605.5, 75, 72, 0.716),
    ("Exp 2 cooperativeness", 2885, 75, 72, 0.472),
]


def two_tailed(u, n1, n2):
    mean = n1 * n2 / 2
    sd = math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12)
    z = (u - mean) / sd
    return math.erfc(abs(z) / math.sqrt(2))


for name, u, n1, n2, published in TESTS:
    p2 = two_tailed(u, n1, n2)
    print(
        f"{name}: two-tailed p = {p2:.3f}, published p = {published:.3f}, "
        f"smallest one-tailed p = {p2 / 2:.3f}"
    )
