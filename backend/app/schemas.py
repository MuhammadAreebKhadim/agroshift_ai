from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- FARM SCHEMAS ---
class FarmBase(BaseModel):
    name: str = Field(..., example="Hassan Green Valley Farm")
    location_name: str = Field("Faisalabad, Pakistan", example="Faisalabad, Pakistan")
    latitude: float = Field(..., example=31.4504)
    longitude: float = Field(..., example=73.1350)
    area: float = Field(5.0, example=5.0)
    soil_type: str = Field("Loamy", example="Loamy")
    soil_ph: float = Field(7.5, example=7.5)
    irrigation_type: str = Field("Canal / Groundwater", example="Canal / Groundwater")
    current_crop: str = Field("Wheat", example="Wheat")
    priority: str = Field("Soil Health", example="Soil Health")

class FarmCreate(FarmBase):
    pass

class FarmResponse(FarmBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- NASA SCHEMAS ---
class DailyWeatherRecord(BaseModel):
    date: str
    temperature: float
    max_temperature: float
    min_temperature: float
    precipitation: float
    solar_radiation: float

class NASASummary(BaseModel):
    avg_temperature: float
    total_precipitation: float
    max_temperature_recorded: float
    min_temperature_recorded: float
    avg_solar_radiation: float
    heat_stress_days: int
    frost_risk_days: int
    longest_dry_spell_days: int
    rabi_precipitation: float
    kharif_precipitation: float

class NASAIndicators(BaseModel):
    water_scarcity_level: str
    thermal_suitability: str
    heat_stress_risk: str
    frost_risk: str
    solar_radiation_status: str

class NASADataResponse(BaseModel):
    status: str
    source: str
    coordinates: Dict[str, float]
    summary: Dict[str, Any]
    indicators: Dict[str, Any]
    monthly_data: Optional[List[Dict[str, Any]]] = None
    daily_data: Optional[List[Dict[str, Any]]] = None


# --- ROTATION SCHEMAS ---
class ScoreBreakdown(BaseModel):
    climate: float
    water: float
    soil: float
    priority: float
    overall: float

class FormulaBreakdown(BaseModel):
    formula: str
    climate_contribution: float
    water_contribution: float
    soil_contribution: float
    priority_contribution: float

class CropProfile(BaseModel):
    name: str
    season: str
    water_demand_mm: int
    n_fixation: int
    soil_fit: str
    benefit: str

class StrategyResponse(BaseModel):
    strategy_key: str
    strategy_name: str
    crop_sequence: str
    crops_list: List[str]
    objective: str
    overall_score: float
    scores: ScoreBreakdown
    formula_breakdown: FormulaBreakdown
    water_footprint_mm: int
    nitrogen_balance_kg_ha: int
    pros: List[str]
    risks: List[str]
    crop_profiles: List[CropProfile]


# --- SIMULATION SCHEMAS ---
class SimulationRequest(BaseModel):
    rainfall_change_pct: float = Field(0.0, ge=-50.0, le=50.0, example=-20.0)
    temperature_change_c: float = Field(0.0, ge=-5.0, le=5.0, example=2.0)
    water_change_pct: float = Field(0.0, ge=-50.0, le=50.0, example=-30.0)

class SimulatedStrategy(BaseModel):
    strategy_key: str
    strategy_name: str
    crop_sequence: str
    objective: str
    baseline_score: float
    simulated_score: float
    delta: float
    baseline_rank: int
    simulated_rank: int
    rank_shift: int
    scores: ScoreBreakdown
    formula_breakdown: FormulaBreakdown
    insight: str
    pros: List[str]
    risks: List[str]

class SimulationResponse(BaseModel):
    scenario: Dict[str, Any]
    winner_changed: bool
    takeaway: str
    strategies: List[SimulatedStrategy]


# --- AI ASSISTANT SCHEMAS ---
class ChatRequest(BaseModel):
    farm_id: Optional[int] = None
    prompt: Optional[str] = Field(None, example="Why is Strategy B better under limited rainfall?")
    message: Optional[str] = Field(None, example="Why is Strategy B better under limited rainfall?")
    query: Optional[str] = None
    question: Optional[str] = None
    farm_context: Optional[Dict[str, Any]] = None
    simulation_context: Optional[Dict[str, Any]] = None
    api_key: Optional[str] = None

    def get_prompt_text(self) -> str:
        for val in (self.prompt, self.message, self.query, self.question):
            if val and isinstance(val, str) and val.strip():
                return val.strip()
        return "What crop rotation strategy is most suitable for my farm and climate?"

class ChatResponse(BaseModel):
    prompt: str
    response: str
    provider: Optional[str] = "groq"
