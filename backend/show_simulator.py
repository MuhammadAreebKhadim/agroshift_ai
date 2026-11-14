import sys, json

d = json.load(sys.stdin)
sc = d["scenario"]
strats = d["strategies"]

print("=" * 65)
print("  AGROSHIFT AI — WHAT-IF SIMULATOR OUTPUT")
print("=" * 65)
print(f"\n  STRESS SCENARIO APPLIED:")
print(f"    Rainfall:     {sc['rainfall_change_pct']:+.0f}%")
print(f"    Temperature:  {sc['temperature_change_c']:+.1f}C above historical average")
print(f"    Irrigation:   {sc['water_change_pct']:+.0f}% (canal/groundwater availability)")
print(f"\n  WINNER CHANGED: {d['winner_changed']}")
print(f"  KEY TAKEAWAY:   {d['takeaway'][:100]}...")
print("\n" + "-" * 65)
print(f"  {'STRATEGY':<35} {'BASE':>6} {'STRESSED':>9} {'DELTA':>7} {'RANK SHIFT':>12}")
print("-" * 65)
for s in strats:
    shift_str = f"#{s['baseline_rank']} -> #{s['simulated_rank']}"
    arrow = " (Climbed!)" if s["rank_shift"] > 0 else (" (Dropped)" if s["rank_shift"] < 0 else " (Stable)")
    print(f"  {s['strategy_name'][:34]:<35} {s['baseline_score']:>6.1f} {s['simulated_score']:>9.1f} {s['delta']:>+7.1f} {shift_str:>8}{arrow}")
print("=" * 65)
