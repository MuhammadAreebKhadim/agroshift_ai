"""
AgroShift AI - Crop Rotation Recommendation Engine
Deterministic, scientifically grounded rule engine evaluating multi-season crop sequences
against NASA POWER environmental data and farmer soil/operational inputs.
"""

from typing import Dict, Any, List
from ..data.crop_matrix import CROP_DATABASE

IRRIGATION_CAPACITY_MM = {
    "Canal / Groundwater": 350.0,
    "Groundwater / Tube Well": 300.0,
    "Canal Only": 220.0,
    "Drip / Micro-irrigation": 400.0,  # High water delivery efficiency
    "Rainfed (Barani)": 0.0           # 100% reliant on NASA precipitation
}

def calculate_crop_climate_score(crop_meta: Dict[str, Any], env_summary: Dict[str, Any], temp_shift: float = 0.0) -> float:
    """
    Score 0 - 100 based on temperature envelope and heat/frost risk days.
    """
    avg_temp = env_summary.get("avg_temperature", 25.0) + temp_shift
    heat_days = env_summary.get("heat_stress_days", 30)
    frost_days = env_summary.get("frost_risk_days", 2)

    # Base thermal match
    opt_min = crop_meta["temp_opt_min"]
    opt_max = crop_meta["temp_opt_max"]
    limit_max = crop_meta["temp_limit_max"]

    if opt_min <= avg_temp <= opt_max:
        base = 95.0
    elif avg_temp < opt_min:
        base = max(40.0, 95.0 - (opt_min - avg_temp) * 6.0)
    else:
        base = max(35.0, 95.0 - (avg_temp - opt_max) * 7.0)

    # Heat stress adjustment
    if temp_shift > 0:
        # Each +1°C adds simulated heat stress days
        heat_days += int(temp_shift * 12)

    if heat_days > 40:
        if crop_meta["heat_tolerance"] in ["Very High", "High"]:
            base -= 2.0  # Well adapted (e.g. Sorghum, Pearl Millet)
        elif crop_meta["heat_tolerance"] == "Medium":
            base -= 12.0
        else:
            base -= 25.0  # Severe penalty for heat-vulnerable crops (e.g. Lentils, Berseem in hot weather)

    # Frost penalty
    if frost_days > 5 and crop_meta["frost_sensitive"]:
        base -= 15.0

    return round(min(100.0, max(10.0, base)), 1)


def calculate_crop_water_score(
    crop_meta: Dict[str, Any],
    env_summary: Dict[str, Any],
    irrigation_type: str,
    rainfall_factor: float = 1.0,
    irrigation_factor: float = 1.0
) -> float:
    """
    Score 0 - 100 based on available water (NASA rain + farmer irrigation) vs. crop water requirement.
    """
    season = crop_meta["season"]
    if season == "Rabi":
        nasa_rain = env_summary.get("rabi_precipitation", 120.0) * rainfall_factor
    elif season == "Kharif":
        nasa_rain = env_summary.get("kharif_precipitation", 280.0) * rainfall_factor
    else:  # Zaid / Summer catch
        nasa_rain = (env_summary.get("total_precipitation", 400.0) * 0.2) * rainfall_factor

    irrigation_avail = IRRIGATION_CAPACITY_MM.get(irrigation_type, 300.0) * irrigation_factor
    total_water_avail = nasa_rain + irrigation_avail
    water_demand = crop_meta["water_demand_mm"]

    ratio = total_water_avail / max(1.0, water_demand)

    if ratio >= 1.0:
        # Adequate water
        score = 95.0
        # If way too much water for a drought-hardy legume (waterlogging risk)
        if ratio > 1.8 and crop_meta["type"] == "Pulse/Legume":
            score -= 15.0
    else:
        # Deficit
        deficit_pct = (1.0 - ratio) * 100
        tolerance = crop_meta["drought_tolerance"]
        if tolerance == "Very High":
            penalty = deficit_pct * 0.35
        elif tolerance == "High":
            penalty = deficit_pct * 0.55
        elif tolerance == "Medium":
            penalty = deficit_pct * 0.85
        else:  # Low drought tolerance (e.g. Rice, Maize)
            penalty = deficit_pct * 1.35
        score = max(15.0, 95.0 - penalty)

    return round(score, 1)


def calculate_crop_soil_score(crop_meta: Dict[str, Any], soil_type: str, soil_ph: float) -> float:
    """
    Score 0 - 100 based on soil texture and pH curve tolerance.
    """
    # Texture match
    compatible_textures = crop_meta["soil_textures"]
    if soil_type in compatible_textures:
        texture_score = 95.0
    elif any(s.lower() in soil_type.lower() for s in compatible_textures):
        texture_score = 80.0
    else:
        texture_score = 45.0

    # pH match
    ph_min = crop_meta["soil_ph_min"]
    ph_max = crop_meta["soil_ph_max"]
    ph_opt = crop_meta["soil_ph_opt"]

    if ph_min <= soil_ph <= ph_max:
        deviation = abs(soil_ph - ph_opt)
        ph_score = max(70.0, 95.0 - (deviation * 15.0))
    else:
        deviation = min(abs(soil_ph - ph_min), abs(soil_ph - ph_max))
        ph_score = max(20.0, 65.0 - (deviation * 25.0))

    return round((texture_score * 0.55) + (ph_score * 0.45), 1)


def calculate_priority_score(crop_meta: Dict[str, Any], priority: str) -> float:
    """
    Score 0 - 100 matching farmer's operational priority.
    """
    if priority == "Soil Health":
        n_fix = crop_meta["nitrogen_fixation_kg_ha"]
        if n_fix >= 80:
            return 98.0  # Berseem, Soybean
        elif n_fix >= 40:
            return 90.0  # Chickpea, Lentils, Mung Bean
        elif crop_meta["type"] == "Oilseed":
            return 80.0  # Biofumigation
        else:
            return 60.0

    elif priority == "Water Conservation":
        tolerance = crop_meta["drought_tolerance"]
        demand = crop_meta["water_demand_mm"]
        if tolerance in ["Very High", "High"] and demand <= 350:
            return 96.0  # Chickpea, Lentils, Sorghum, Pearl Millet
        elif demand <= 450:
            return 80.0
        else:
            return 45.0  # High water consumers like Rice or Maize

    else:  # Yield / Commercial Profit
        val = crop_meta["economic_value"]
        if val == "High":
            return 95.0
        elif val == "Medium":
            return 75.0
        else:
            return 55.0


def generate_candidate_rotations(
    current_crop: str,
    soil_type: str,
    soil_ph: float,
    irrigation_type: str,
    priority: str,
    env_summary: Dict[str, Any],
    rainfall_delta_pct: float = 0.0,
    temp_delta_c: float = 0.0,
    irrigation_delta_pct: float = 0.0
) -> List[Dict[str, Any]]:
    """
    Generates and scores 3 candidate strategies:
    Strategy A: Soil Health & Nitrogen Rejuvenation
    Strategy B: Climate-Resilient & Water-Conscious Rotation
    Strategy C: High-Value Commercial & Crop Diversification
    """
    rainfall_factor = max(0.1, 1.0 + (rainfall_delta_pct / 100.0))
    irrigation_factor = max(0.1, 1.0 + (irrigation_delta_pct / 100.0))

    # Define candidate sequences based on current crop
    curr = current_crop if current_crop in CROP_DATABASE else "Wheat"

    if curr == "Wheat":
        seq_a = ["Wheat", "Chickpea", "Maize"]
        seq_b = ["Wheat", "Pearl Millet", "Chickpea"]
        seq_c = ["Wheat", "Berseem", "Maize"]
    elif curr == "Maize":
        seq_a = ["Maize", "Berseem", "Wheat"]
        seq_b = ["Maize", "Mustard", "Chickpea"]
        seq_c = ["Maize", "Soybean", "Wheat"]
    elif curr == "Cotton":
        seq_a = ["Cotton", "Berseem", "Wheat"]
        seq_b = ["Cotton", "Chickpea", "Sorghum"]
        seq_c = ["Cotton", "Wheat", "Mung Bean"]
    elif curr == "Rice":
        seq_a = ["Rice", "Berseem", "Maize"]
        seq_b = ["Rice", "Lentils", "Sorghum"]
        seq_c = ["Rice", "Wheat", "Mung Bean"]
    elif curr == "Sugarcane":
        seq_a = ["Sugarcane", "Berseem", "Wheat"]
        seq_b = ["Sugarcane", "Chickpea", "Sorghum"]
        seq_c = ["Sugarcane", "Mung Bean", "Mustard"]
    else:  # Default
        seq_a = [curr, "Chickpea", "Maize"]
        seq_b = [curr, "Pearl Millet", "Chickpea"]
        seq_c = [curr, "Berseem", "Maize"]

    candidates = [
        {
            "strategy_key": "strategy_a",
            "strategy_name": "Strategy A — Soil Improvement",
            "crops": seq_a,
            "objective": "Legume inclusion, biological nitrogen fixation & balanced crop rotation",
            "pros": [
                "Includes Chickpea legume to recharge biological soil nitrogen naturally.",
                "Fractures subsurface hardpan without intensive tillage.",
                "Balanced rotation maintaining household cereal grain supply with Maize."
            ],
            "risks": [
                "Maize requires steady irrigation; vulnerable under severe summer heat waves.",
                "Chickpea requires good field drainage during heavy unseasonal rainfall."
            ]
        },
        {
            "strategy_key": "strategy_b",
            "strategy_name": "Strategy B — Water Conscious",
            "crops": seq_b,
            "objective": "Exploring lower-water-demand alternatives, water conservation & climate resilience",
            "pros": [
                "Pearl Millet & Chickpea have low water footprints and extreme heat tolerance.",
                "Saves 35-45% irrigation volume compared to traditional crop sequences.",
                "Climbs to Rank #1 under drought or canal water rationing scenarios."
            ],
            "risks": [
                "Millet requires established local grain/fodder market linkages.",
                "Requires careful sowing depth in dry topsoil conditions."
            ]
        },
        {
            "strategy_key": "strategy_c",
            "strategy_name": "Strategy C — Diversified Farming",
            "crops": seq_c,
            "objective": "Fodder production, crop diversification & alternative farm utilization",
            "pros": [
                "Berseem clover provides 4-6 cuttings of premium high-protein dairy livestock fodder.",
                "Generates steady weekly cash flow during winter months.",
                "Enriched soil microbial biomass preceding spring planting."
            ],
            "risks": [
                "Berseem requires multiple light irrigation turns during initial seedling establishment.",
                "Higher labor requirement for frequent fodder harvesting."
            ]
        }
    ]

    results = []
    for cand in candidates:
        crop_names = cand["crops"]
        crop_objs = [CROP_DATABASE.get(c, CROP_DATABASE["Wheat"]) for c in crop_names]

        # Calculate scores per crop in sequence
        clim_scores = [calculate_crop_climate_score(c, env_summary, temp_delta_c) for c in crop_objs]
        water_scores = [calculate_crop_water_score(c, env_summary, irrigation_type, rainfall_factor, irrigation_factor) for c in crop_objs]
        soil_scores = [calculate_crop_soil_score(c, soil_type, soil_ph) for c in crop_objs]
        pri_scores = [calculate_priority_score(c, priority) for c in crop_objs]

        # Weighted averages for the rotation sequence
        avg_clim = sum(clim_scores) / len(clim_scores)
        avg_water = sum(water_scores) / len(water_scores)
        avg_soil = sum(soil_scores) / len(soil_scores)
        avg_pri = sum(pri_scores) / len(pri_scores)

        # Standard Transparent Formula:
        # Total = 30% Climate + 25% Water + 25% Soil + 20% Priority
        total_score = round((0.30 * avg_clim) + (0.25 * avg_water) + (0.25 * avg_soil) + (0.20 * avg_pri), 1)

        total_water_mm = sum([c["water_demand_mm"] for c in crop_objs])
        total_n_fix = sum([c["nitrogen_fixation_kg_ha"] for c in crop_objs])

        results.append({
            "strategy_key": cand["strategy_key"],
            "strategy_name": cand["strategy_name"],
            "crop_sequence": " → ".join(crop_names),
            "crops_list": crop_names,
            "objective": cand["objective"],
            "overall_score": total_score,
            "scores": {
                "climate": round(avg_clim, 1),
                "water": round(avg_water, 1),
                "soil": round(avg_soil, 1),
                "priority": round(avg_pri, 1),
                "overall": total_score
            },
            "formula_breakdown": {
                "formula": "0.30 * Climate + 0.25 * Water + 0.25 * Soil + 0.20 * Priority",
                "climate_contribution": round(0.30 * avg_clim, 1),
                "water_contribution": round(0.25 * avg_water, 1),
                "soil_contribution": round(0.25 * avg_soil, 1),
                "priority_contribution": round(0.20 * avg_pri, 1)
            },
            "water_footprint_mm": total_water_mm,
            "nitrogen_balance_kg_ha": total_n_fix,
            "pros": cand["pros"],
            "risks": cand["risks"],
            "crop_profiles": [
                {
                    "name": c["name"],
                    "season": c["season"],
                    "water_demand_mm": c["water_demand_mm"],
                    "n_fixation": c["nitrogen_fixation_kg_ha"],
                    "soil_fit": f"pH {c['soil_ph_min']}-{c['soil_ph_max']}, {', '.join(c['soil_textures'][:2])}",
                    "benefit": c["agronomic_benefits"]
                }
                for c in crop_objs
            ]
        })

    # Sort descending by overall score so the top recommended strategy is first
    results.sort(key=lambda x: x["overall_score"], reverse=True)
    return results
