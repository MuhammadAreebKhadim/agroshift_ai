from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import Farm
from ..schemas import StrategyResponse
from ..services.nasa_service import fetch_nasa_power_data
from ..services.rotation_engine import generate_candidate_rotations
from ..data.crop_matrix import CROP_DATABASE

router = APIRouter(prefix="/rotations", tags=["Crop Rotation Engine"])

@router.get("/crops", response_model=Dict[str, Any])
async def get_crop_matrix():
    """
    Returns the comprehensive 13-crop agronomic knowledge matrix compiled from FAO, PARC, and NARC.
    """
    return {
        "count": len(CROP_DATABASE),
        "crops": list(CROP_DATABASE.values())
    }

@router.get("/recommendations/{farm_id}", response_model=List[StrategyResponse])
@router.get("/farm/{farm_id}", response_model=List[StrategyResponse])
@router.get("/{farm_id}", response_model=List[StrategyResponse])
async def get_rotations_for_farm(farm_id: int, db: Session = Depends(get_db)):
    """
    Evaluates 3 candidate crop rotation strategies for a given farm
    using its soil inputs and NASA POWER climate indicators.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Fetch NASA data for the farm's location
    nasa_data = await fetch_nasa_power_data(farm.latitude, farm.longitude)
    env_summary = nasa_data["summary"]

    strategies = generate_candidate_rotations(
        current_crop=farm.current_crop,
        soil_type=farm.soil_type,
        soil_ph=farm.soil_ph,
        irrigation_type=farm.irrigation_type,
        priority=farm.priority,
        env_summary=env_summary
    )
    return strategies
