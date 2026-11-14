import { CROP_DATABASE, CropData } from "./cropMatrix";

export const IRRIGATION_CAPACITY_MM: Record<string, number> = {
  "Canal / Groundwater": 350.0,
  "Groundwater / Tube Well": 300.0,
  "Canal Only": 220.0,
  "Drip / Micro-irrigation": 400.0,
  "Rainfed (Barani)": 0.0,
};

export function calculateCropClimateScore(
  cropMeta: CropData,
  envSummary: Record<string, any>,
  tempShift: number = 0.0
): number {
  const avgTemp = (envSummary.avg_temperature ?? 25.0) + tempShift;
  let heatDays = envSummary.heat_stress_days ?? 30;
  const frostDays = envSummary.frost_risk_days ?? 2;

  const optMin = cropMeta.temp_opt_min;
  const optMax = cropMeta.temp_opt_max;

  let base = 95.0;
  if (avgTemp >= optMin && avgTemp <= optMax) {
    base = 95.0;
  } else if (avgTemp < optMin) {
    base = Math.max(40.0, 95.0 - (optMin - avgTemp) * 6.0);
  } else {
    base = Math.max(35.0, 95.0 - (avgTemp - optMax) * 7.0);
  }

  if (tempShift > 0) {
    heatDays += Math.floor(tempShift * 12);
  }

  if (heatDays > 40) {
    if (cropMeta.heat_tolerance === "Very High" || cropMeta.heat_tolerance === "High") {
      base -= 2.0;
    } else if (cropMeta.heat_tolerance === "Medium") {
      base -= 12.0;
    } else {
      base -= 25.0;
    }
  }

  if (frostDays > 5 && cropMeta.frost_sensitive) {
    base -= 15.0;
  }

  return Math.round(Math.min(100.0, Math.max(10.0, base)) * 10) / 10;
}

export function calculateCropWaterScore(
  cropMeta: CropData,
  envSummary: Record<string, any>,
  irrigationType: string,
  rainfallFactor: number = 1.0,
  irrigationFactor: number = 1.0
): number {
  const season = cropMeta.season;
  let nasaRain = 120.0;
  if (season === "Rabi") {
    nasaRain = (envSummary.rabi_precipitation ?? 120.0) * rainfallFactor;
  } else if (season === "Kharif") {
    nasaRain = (envSummary.kharif_precipitation ?? 280.0) * rainfallFactor;
  } else {
    nasaRain = ((envSummary.total_precipitation ?? 400.0) * 0.2) * rainfallFactor;
  }

  const irrigationAvail = (IRRIGATION_CAPACITY_MM[irrigationType] ?? 300.0) * irrigationFactor;
  const totalWaterAvail = nasaRain + irrigationAvail;
  const waterDemand = cropMeta.water_demand_mm;

  const ratio = totalWaterAvail / Math.max(1.0, waterDemand);
  let score = 95.0;

  if (ratio >= 1.0) {
    score = 95.0;
    if (ratio > 1.8 && cropMeta.type === "Pulse/Legume") {
      score -= 15.0;
    }
  } else {
    const deficitPct = (1.0 - ratio) * 100;
    const tolerance = cropMeta.drought_tolerance;
    let penalty = 0;
    if (tolerance === "Very High") {
      penalty = deficitPct * 0.35;
    } else if (tolerance === "High") {
      penalty = deficitPct * 0.55;
    } else if (tolerance === "Medium") {
      penalty = deficitPct * 0.85;
    } else {
      penalty = deficitPct * 1.35;
    }
    score = Math.max(15.0, 95.0 - penalty);
  }

  return Math.round(score * 10) / 10;
}

export function calculateCropSoilScore(
  cropMeta: CropData,
  soilType: string,
  soilPh: number
): number {
  const compatibleTextures = cropMeta.soil_textures;
  let textureScore = 45.0;
  if (compatibleTextures.includes(soilType)) {
    textureScore = 95.0;
  } else if (compatibleTextures.some((s) => soilType.toLowerCase().includes(s.toLowerCase()))) {
    textureScore = 80.0;
  }

  const phMin = cropMeta.soil_ph_min;
  const phMax = cropMeta.soil_ph_max;
  const phOpt = cropMeta.soil_ph_opt;

  let phScore = 70.0;
  if (soilPh >= phMin && soilPh <= phMax) {
    const deviation = Math.abs(soilPh - phOpt);
    phScore = Math.max(70.0, 95.0 - deviation * 15.0);
  } else {
    const deviation = Math.min(Math.abs(soilPh - phMin), Math.abs(soilPh - phMax));
    phScore = Math.max(20.0, 65.0 - deviation * 25.0);
  }

  return Math.round((textureScore * 0.55 + phScore * 0.45) * 10) / 10;
}

export function calculatePriorityScore(cropMeta: CropData, priority: string): number {
  if (priority === "Soil Health") {
    const nFix = cropMeta.nitrogen_fixation_kg_ha;
    if (nFix >= 80) return 98.0;
    if (nFix >= 40) return 90.0;
    if (cropMeta.type === "Oilseed") return 80.0;
    return 60.0;
  } else if (priority === "Water Conservation") {
    const tolerance = cropMeta.drought_tolerance;
    const demand = cropMeta.water_demand_mm;
    if ((tolerance === "Very High" || tolerance === "High") && demand <= 350) {
      return 96.0;
    } else if (demand <= 450) {
      return 80.0;
    } else {
      return 45.0;
    }
  } else {
    const val = cropMeta.economic_value;
    if (val === "High") return 95.0;
    if (val === "Medium") return 75.0;
    return 55.0;
  }
}

export function generateCandidateRotations(
  currentCrop: string,
  soilType: string,
  soilPh: number,
  irrigationType: string,
  priority: string,
  envSummary: Record<string, any>,
  rainfallDeltaPct: number = 0.0,
  tempDeltaC: number = 0.0,
  irrigationDeltaPct: number = 0.0
): any[] {
  const rainfallFactor = Math.max(0.1, 1.0 + rainfallDeltaPct / 100.0);
  const irrigationFactor = Math.max(0.1, 1.0 + irrigationDeltaPct / 100.0);

  const curr = CROP_DATABASE[currentCrop] ? currentCrop : "Wheat";

  let seqA: string[] = [];
  let seqB: string[] = [];
  let seqC: string[] = [];

  if (curr === "Wheat") {
    seqA = ["Wheat", "Chickpea", "Maize"];
    seqB = ["Wheat", "Pearl Millet", "Chickpea"];
    seqC = ["Wheat", "Berseem", "Maize"];
  } else if (curr === "Maize") {
    seqA = ["Maize", "Berseem", "Wheat"];
    seqB = ["Maize", "Mustard", "Chickpea"];
    seqC = ["Maize", "Soybean", "Wheat"];
  } else if (curr === "Cotton") {
    seqA = ["Cotton", "Berseem", "Wheat"];
    seqB = ["Cotton", "Chickpea", "Sorghum"];
    seqC = ["Cotton", "Wheat", "Mung Bean"];
  } else if (curr === "Rice") {
    seqA = ["Rice", "Berseem", "Maize"];
    seqB = ["Rice", "Lentils", "Sorghum"];
    seqC = ["Rice", "Wheat", "Mung Bean"];
  } else if (curr === "Sugarcane") {
    seqA = ["Sugarcane", "Berseem", "Wheat"];
    seqB = ["Sugarcane", "Chickpea", "Sorghum"];
    seqC = ["Sugarcane", "Mung Bean", "Mustard"];
  } else {
    seqA = [curr, "Chickpea", "Maize"];
    seqB = [curr, "Pearl Millet", "Chickpea"];
    seqC = [curr, "Berseem", "Maize"];
  }

  const candidates = [
    {
      strategy_key: "strategy_a",
      strategy_name: "Strategy A — Soil Improvement",
      crops: seqA,
      objective: "Legume inclusion, biological nitrogen fixation & balanced crop rotation",
      pros: [
        "Includes Chickpea legume to recharge biological soil nitrogen naturally.",
        "Fractures subsurface hardpan without intensive tillage.",
        "Balanced rotation maintaining household cereal grain supply with Maize.",
      ],
      risks: [
        "Maize requires steady irrigation; vulnerable under severe summer heat waves.",
        "Chickpea requires good field drainage during heavy unseasonal rainfall.",
      ],
    },
    {
      strategy_key: "strategy_b",
      strategy_name: "Strategy B — Water Conscious",
      crops: seqB,
      objective: "Exploring lower-water-demand alternatives, water conservation & climate resilience",
      pros: [
        "Pearl Millet & Chickpea have low water footprints and extreme heat tolerance.",
        "Saves 35-45% irrigation volume compared to traditional crop sequences.",
        "Climbs to Rank #1 under drought or canal water rationing scenarios.",
      ],
      risks: [
        "Millet requires established local grain/fodder market linkages.",
        "Requires careful sowing depth in dry topsoil conditions.",
      ],
    },
    {
      strategy_key: "strategy_c",
      strategy_name: "Strategy C — Diversified Farming",
      crops: seqC,
      objective: "Fodder production, crop diversification & alternative farm utilization",
      pros: [
        "Berseem clover provides 4-6 cuttings of premium high-protein dairy livestock fodder.",
        "Generates steady weekly cash flow during winter months.",
        "Enriched soil microbial biomass preceding spring planting.",
      ],
      risks: [
        "Berseem requires multiple light irrigation turns during initial seedling establishment.",
        "Higher labor requirement for frequent fodder harvesting.",
      ],
    },
  ];

  const results = candidates.map((cand) => {
    const cropNames = cand.crops;
    const cropObjs = cropNames.map((c) => CROP_DATABASE[c] || CROP_DATABASE["Wheat"]);

    const climScores = cropObjs.map((c) => calculateCropClimateScore(c, envSummary, tempDeltaC));
    const waterScores = cropObjs.map((c) =>
      calculateCropWaterScore(c, envSummary, irrigationType, rainfallFactor, irrigationFactor)
    );
    const soilScores = cropObjs.map((c) => calculateCropSoilScore(c, soilType, soilPh));
    const priScores = cropObjs.map((c) => calculatePriorityScore(c, priority));

    const avgClim = climScores.reduce((a, b) => a + b, 0) / climScores.length;
    const avgWater = waterScores.reduce((a, b) => a + b, 0) / waterScores.length;
    const avgSoil = soilScores.reduce((a, b) => a + b, 0) / soilScores.length;
    const avgPri = priScores.reduce((a, b) => a + b, 0) / priScores.length;

    const totalScore =
      Math.round((0.3 * avgClim + 0.25 * avgWater + 0.25 * avgSoil + 0.2 * avgPri) * 10) / 10;

    const totalWaterMm = cropObjs.reduce((acc, c) => acc + c.water_demand_mm, 0);
    const totalNFix = cropObjs.reduce((acc, c) => acc + c.nitrogen_fixation_kg_ha, 0);

    return {
      strategy_key: cand.strategy_key,
      strategy_name: cand.strategy_name,
      crop_sequence: cropNames.join(" → "),
      crops_list: cropNames,
      objective: cand.objective,
      overall_score: totalScore,
      scores: {
        climate: Math.round(avgClim * 10) / 10,
        water: Math.round(avgWater * 10) / 10,
        soil: Math.round(avgSoil * 10) / 10,
        priority: Math.round(avgPri * 10) / 10,
        overall: totalScore,
      },
      formula_breakdown: {
        formula: "0.30 * Climate + 0.25 * Water + 0.25 * Soil + 0.20 * Priority",
        climate_contribution: Math.round(0.3 * avgClim * 10) / 10,
        water_contribution: Math.round(0.25 * avgWater * 10) / 10,
        soil_contribution: Math.round(0.25 * avgSoil * 10) / 10,
        priority_contribution: Math.round(0.2 * avgPri * 10) / 10,
      },
      water_footprint_mm: totalWaterMm,
      nitrogen_balance_kg_ha: totalNFix,
      pros: cand.pros,
      risks: cand.risks,
      crop_profiles: cropObjs.map((c) => ({
        name: c.name,
        season: c.season,
        water_demand_mm: c.water_demand_mm,
        n_fixation: c.nitrogen_fixation_kg_ha,
        soil_fit: `pH ${c.soil_ph_min}-${c.soil_ph_max}, ${c.soil_textures.slice(0, 2).join(", ")}`,
        benefit: c.agronomic_benefits,
      })),
    };
  });

  results.sort((a, b) => b.overall_score - a.overall_score);
  return results;
}

export function runSimulation(
  currentCrop: string,
  soilType: string,
  soilPh: number,
  irrigationType: string,
  priority: string,
  envSummary: Record<string, any>,
  rainfallChangePct: number,
  temperatureChangeC: number,
  waterChangePct: number
): any {
  const baselineStrategies = generateCandidateRotations(
    currentCrop,
    soilType,
    soilPh,
    irrigationType,
    priority,
    envSummary,
    0.0,
    0.0,
    0.0
  );
  const baselineLookup: Record<string, any> = {};
  baselineStrategies.forEach((s) => {
    baselineLookup[s.strategy_key] = s;
  });

  const stressedStrategies = generateCandidateRotations(
    currentCrop,
    soilType,
    soilPh,
    irrigationType,
    priority,
    envSummary,
    rainfallChangePct,
    temperatureChangeC,
    waterChangePct
  );

  const baselineWinner = baselineStrategies[0]?.strategy_key;
  const stressedWinner = stressedStrategies[0]?.strategy_key;
  const winnerChanged = baselineWinner !== stressedWinner;

  const comparisonResults = stressedStrategies.map((st, idx) => {
    const sKey = st.strategy_key;
    const base = baselineLookup[sKey] || st;
    const baseScore = base.overall_score;
    const currScore = st.overall_score;
    const delta = Math.round((currScore - baseScore) * 10) / 10;

    const baseRank = baselineStrategies.findIndex((b) => b.strategy_key === sKey) + 1;
    const rank = idx + 1;

    let insight = "";
    if (delta < -10.0) {
      insight = `Vulnerable under this scenario: High water requirement and heat-sensitive phenology reduce score by ${Math.abs(
        delta
      )} pts.`;
    } else if (delta > -4.0) {
      insight = `Highly resilient: Drought/heat-adapted crops maintain physiological vigor under stress (only ${delta} pts change).`;
    } else {
      insight = "Moderate adaptation: Moderate yield penalty under combined thermal and moisture deficit.";
    }

    return {
      strategy_key: sKey,
      strategy_name: st.strategy_name,
      crop_sequence: st.crop_sequence,
      objective: st.objective,
      baseline_score: baseScore,
      simulated_score: currScore,
      delta: delta,
      baseline_rank: baseRank,
      simulated_rank: rank,
      rank_shift: baseRank - rank,
      scores: st.scores,
      formula_breakdown: st.formula_breakdown,
      insight: insight,
      pros: st.pros,
      risks: st.risks,
    };
  });

  const scenarioDescription = `Rainfall: ${rainfallChangePct >= 0 ? "+" : ""}${Math.round(
    rainfallChangePct
  )}%, Temperature: ${temperatureChangeC >= 0 ? "+" : ""}${temperatureChangeC.toFixed(
    1
  )}°C, Irrigation: ${waterChangePct >= 0 ? "+" : ""}${Math.round(waterChangePct)}%`;

  let overallTakeaway = "";
  if (winnerChanged) {
    overallTakeaway = `Under the selected reduced-rainfall and irrigation scenario, ${stressedStrategies[0]?.strategy_name} becomes relatively more suitable because its candidate sequence emphasizes crops with lower water requirements and superior thermal resilience.`;
  } else {
    overallTakeaway = `${stressedStrategies[0]?.strategy_name} continues to lead as the preferred strategy with ${stressedStrategies[0]?.overall_score}/100, showing strong baseline resilience.`;
  }

  return {
    scenario: {
      rainfall_change_pct: rainfallChangePct,
      temperature_change_c: temperatureChangeC,
      water_change_pct: waterChangePct,
      description: scenarioDescription,
    },
    winner_changed: winnerChanged,
    takeaway: overallTakeaway,
    strategies: comparisonResults,
  };
}
