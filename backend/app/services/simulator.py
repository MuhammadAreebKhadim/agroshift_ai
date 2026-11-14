"""
AgroShift AI - What-If Scenario Simulator
Evaluates climate stress conditions (-30% rain, +3°C heat, -30% irrigation)
and recalculates rotation strategy suitability rankings in real-time.
"""

from typing import Dict, Any, List
from .rotation_engine import generate_candidate_rotations

def run_simulation(
    current_crop: str,
    soil_type: str,
    soil_ph: float,
    irrigation_type: str,
    priority: str,
    env_summary: Dict[str, Any],
    rainfall_change_pct: float,
    temperature_change_c: float,
    water_change_pct: float
) -> Dict[str, Any]:
    """
    Runs baseline vs. stressed scenario comparison.
    """
    # 1. Baseline Run (No stress)
    baseline_strategies = generate_candidate_rotations(
        current_crop=current_crop,
        soil_type=soil_type,
        soil_ph=soil_ph,
        irrigation_type=irrigation_type,
        priority=priority,
        env_summary=env_summary,
        rainfall_delta_pct=0.0,
        temp_delta_c=0.0,
        irrigation_delta_pct=0.0
    )
    baseline_lookup = {s["strategy_key"]: s for s in baseline_strategies}

    # 2. Stressed Run
    stressed_strategies = generate_candidate_rotations(
        current_crop=current_crop,
        soil_type=soil_type,
        soil_ph=soil_ph,
        irrigation_type=irrigation_type,
        priority=priority,
        env_summary=env_summary,
        rainfall_delta_pct=rainfall_change_pct,
        temp_delta_c=temperature_change_c,
        irrigation_delta_pct=water_change_pct
    )

    comparison_results: List[Dict[str, Any]] = []
    winner_changed = False
    baseline_winner = baseline_strategies[0]["strategy_key"]
    stressed_winner = stressed_strategies[0]["strategy_key"]

    if baseline_winner != stressed_winner:
        winner_changed = True

    for rank, st in enumerate(stressed_strategies, 1):
        s_key = st["strategy_key"]
        base = baseline_lookup.get(s_key, st)
        base_score = base["overall_score"]
        curr_score = st["overall_score"]
        delta = round(curr_score - base_score, 1)

        # Baseline rank
        base_rank = [i for i, b in enumerate(baseline_strategies, 1) if b["strategy_key"] == s_key][0]

        # Generate explanatory note based on why the score changed
        if delta < -10.0:
            insight = f"Vulnerable under this scenario: High water requirement and heat-sensitive phenology reduce score by {abs(delta)} pts."
        elif delta > -4.0:
            insight = f"Highly resilient: Drought/heat-adapted crops maintain physiological vigor under stress (only {delta} pts change)."
        else:
            insight = f"Moderate adaptation: Moderate yield penalty under combined thermal and moisture deficit."

        comparison_results.append({
            "strategy_key": s_key,
            "strategy_name": st["strategy_name"],
            "crop_sequence": st["crop_sequence"],
            "objective": st["objective"],
            "baseline_score": base_score,
            "simulated_score": curr_score,
            "delta": delta,
            "baseline_rank": base_rank,
            "simulated_rank": rank,
            "rank_shift": base_rank - rank,  # Positive = climbed up, Negative = dropped
            "scores": st["scores"],
            "formula_breakdown": st["formula_breakdown"],
            "insight": insight,
            "pros": st["pros"],
            "risks": st["risks"]
        })

    # Summary analysis
    scenario_description = (
        f"Rainfall: {rainfall_change_pct:+0.0f}%, "
        f"Temperature: {temperature_change_c:+0.1f}°C, "
        f"Irrigation: {water_change_pct:+0.0f}%"
    )

    overall_takeaway = ""
    if winner_changed:
        overall_takeaway = (
            f"Under the selected reduced-rainfall and irrigation scenario, {stressed_strategies[0]['strategy_name']} "
            f"becomes relatively more suitable because its candidate sequence emphasizes crops with lower water requirements and superior thermal resilience."
        )
    else:
        overall_takeaway = (
            f"{stressed_strategies[0]['strategy_name']} continues to lead as the preferred strategy "
            f"with {stressed_strategies[0]['overall_score']}/100, showing strong baseline resilience."
        )

    return {
        "scenario": {
            "rainfall_change_pct": rainfall_change_pct,
            "temperature_change_c": temperature_change_c,
            "water_change_pct": water_change_pct,
            "description": scenario_description
        },
        "winner_changed": winner_changed,
        "takeaway": overall_takeaway,
        "strategies": comparison_results
    }
