from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import Farm
from ..schemas import SimulationRequest, SimulationResponse
from ..services.nasa_service import fetch_nasa_power_data
from ..services.simulator import run_simulation

router = APIRouter(prefix="/simulator", tags=["What-If Simulator"])

async def execute_simulation(sim_in: SimulationRequest, farm: Optional[Farm], db: Session):
    if not farm:
        farm = db.query(Farm).order_by(Farm.created_at.desc()).first()

    if not farm:
        current_crop = "Wheat"
        soil_type = "Loamy"
        soil_ph = 7.5
        irrigation_type = "Canal / Groundwater"
        priority = "Soil Health"
        lat, lon = 31.4504, 73.1350
    else:
        current_crop = farm.current_crop
        soil_type = farm.soil_type
        soil_ph = farm.soil_ph
        irrigation_type = farm.irrigation_type
        priority = farm.priority
        lat, lon = farm.latitude, farm.longitude

    nasa_data = await fetch_nasa_power_data(lat, lon)
    env_summary = nasa_data.get("summary", {})

    return run_simulation(
        current_crop=current_crop,
        soil_type=soil_type,
        soil_ph=soil_ph,
        irrigation_type=irrigation_type,
        priority=priority,
        env_summary=env_summary,
        rainfall_change_pct=sim_in.rainfall_change_pct,
        temperature_change_c=sim_in.temperature_change_c,
        water_change_pct=sim_in.water_change_pct
    )

@router.post("/simulate", response_model=SimulationResponse)
@router.post("", response_model=SimulationResponse)
async def simulate_scenario_default(
    sim_in: SimulationRequest,
    db: Session = Depends(get_db)
):
    return await execute_simulation(sim_in, None, db)

@router.post("/simulate/{farm_id}", response_model=SimulationResponse)
@router.post("/farm/{farm_id}", response_model=SimulationResponse)
@router.post("/{farm_id}", response_model=SimulationResponse)
async def simulate_farm_scenario(
    farm_id: int,
    sim_in: SimulationRequest,
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    return await execute_simulation(sim_in, farm, db)
