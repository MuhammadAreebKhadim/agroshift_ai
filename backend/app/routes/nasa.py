from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Farm, EnvironmentalData
from ..schemas import NASADataResponse
from ..services.nasa_service import fetch_nasa_power_data

router = APIRouter(prefix="/nasa", tags=["NASA Earth Intelligence"])

@router.get("/point", response_model=NASADataResponse)
async def get_nasa_data_for_coordinates(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180)
):
    """
    Direct NASA POWER API call for any given coordinates on Earth.
    """
    data = await fetch_nasa_power_data(latitude, longitude)
    return data

@router.get("/farm/{farm_id}", response_model=NASADataResponse)
async def get_nasa_data_for_farm(farm_id: int, db: Session = Depends(get_db)):
    """
    Fetch and cache NASA POWER data for a registered farm.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    data = await fetch_nasa_power_data(farm.latitude, farm.longitude)
    return data
