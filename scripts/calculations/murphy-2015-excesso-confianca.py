# Murphy et al. (2015), Study 3, Table 3: the mean of "Table choice (right)"
# is the share of competitors who chose to sit at the author's table (the
# competitive one), averaged over authors. Prints it as a percentage.
import sys

share = float(sys.argv[1]) if len(sys.argv) > 1 else 0.78
print(f"{share * 100:.0f}%")
