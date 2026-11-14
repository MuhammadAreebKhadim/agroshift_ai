import sys, json

strats = json.load(sys.stdin)
print("=" * 60)
print("  AGROSHIFT AI — ROTATION STRATEGY ENGINE OUTPUT")
print("=" * 60)
for i, s in enumerate(strats):
    rank = i + 1
    score = s["overall_score"]
    name = s["strategy_name"]
    seq = s["crop_sequence"]
    sc = s["scores"]
    fb = s["formula_breakdown"]
    nfix = s["nitrogen_balance_kg_ha"]
    water = s["water_footprint_mm"]
    pros = s["pros"]
    risks = s["risks"]

    label = "  <<< TOP RECOMMENDATION >>>" if rank == 1 else ""
    print(f"\nRank #{rank}: {score}/100  —  {name}{label}")
    print(f"  Rotation: {seq}")
    print(f"  Formula:  0.30 x Climate({sc['climate']}) + 0.25 x Water({sc['water']}) + 0.25 x Soil({sc['soil']}) + 0.20 x Priority({sc['priority']})")
    print(f"  Breakdown: Climate={fb['climate_contribution']} + Water={fb['water_contribution']} + Soil={fb['soil_contribution']} + Priority={fb['priority_contribution']} = {score}")
    print(f"  N-Fixation: +{nfix} kg N/ha  |  Water Footprint: {water} mm/season")
    print(f"  Key Benefit: {pros[0][:80]}...")
    print(f"  Key Risk:    {risks[0][:80]}...")
print("\n" + "=" * 60)
