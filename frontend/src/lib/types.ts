export interface Farm {
  id?: number;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  area: number;
  soil_type: string;
  soil_ph: number;
  irrigation_type: string;
  current_crop: string;
  priority: string;
  created_at?: string;
}

export interface DailyWeather {
  date: string;
  temperature: number;
  max_temperature: number;
  min_temperature: number;
  precipitation: number;
  solar_radiation: number;
}

export interface NASASummary {
  avg_temperature: number;
  total_precipitation: number;
  max_temperature_recorded: number;
  min_temperature_recorded: number;
  avg_solar_radiation: number;
  heat_stress_days: number;
  frost_risk_days: number;
  longest_dry_spell_days: number;
  rabi_precipitation: number;
  kharif_precipitation: number;
  monthly_rainfall_mean?: number;
}

export interface NASAIndicators {
  water_scarcity_level: string;
  thermal_suitability: string;
  heat_stress_risk: string;
  frost_risk?: string;
  solar_radiation_status: string;
  rainfall_trend?: string;
}

export interface NASADataResponse {
  status: string;
  source: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  summary: NASASummary;
  indicators: NASAIndicators;
  monthly_data?: Array<{
    month: string;
    month_code: string;
    temp: number;
    temp_max?: number;
    temp_min?: number;
    rain: number;
    radiation: number;
    baselineTrend: number;
  }>;
  monthly?: any[];
  daily_data?: DailyWeather[];
}

export interface CropProfile {
  name: string;
  season: string;
  water_demand_mm: number;
  n_fixation: number;
  soil_fit: string;
  benefit: string;
}

export interface Strategy {
  strategy_key: string;
  strategy_name: string;
  crop_sequence: string;
  crops_list: string[];
  objective: string;
  overall_score: number;
  scores: {
    climate: number;
    water: number;
    soil: number;
    priority: number;
    overall: number;
  };
  formula_breakdown: {
    formula: string;
    climate_contribution: number;
    water_contribution: number;
    soil_contribution: number;
    priority_contribution: number;
  };
  water_footprint_mm: number;
  nitrogen_balance_kg_ha: number;
  pros: string[];
  risks: string[];
  crop_profiles: CropProfile[];
}

export interface SimulatedStrategy {
  strategy_key: string;
  strategy_name: string;
  crop_sequence: string;
  objective: string;
  baseline_score: number;
  simulated_score: number;
  delta: number;
  baseline_rank: number;
  simulated_rank: number;
  rank_shift: number;
  scores: {
    climate: number;
    water: number;
    soil: number;
    priority: number;
    overall: number;
  };
  formula_breakdown: {
    formula: string;
    climate_contribution: number;
    water_contribution: number;
    soil_contribution: number;
    priority_contribution: number;
  };
  insight: string;
  pros: string[];
  risks: string[];
}

export interface SimulationResult {
  scenario: {
    rainfall_change_pct: number;
    temperature_change_c: number;
    water_change_pct: number;
    description: string;
  };
  winner_changed: boolean;
  takeaway: string;
  strategies: SimulatedStrategy[];
}
