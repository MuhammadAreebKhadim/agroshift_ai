from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Farm
from ..schemas import FarmCreate, FarmResponse

router = APIRouter(prefix="/farms", tags=["Farms"])

@router.post("/", response_model=FarmResponse)
def create_farm(farm_in: FarmCreate, db: Session = Depends(get_db)):
    db_farm = Farm(**farm_in.model_dump())
    db.add(db_farm)
    db.commit()
    db.refresh(db_farm)
    return db_farm

@router.get("/", response_model=List[FarmResponse])
def list_farms(db: Session = Depends(get_db)):
    return db.query(Farm).order_by(Farm.created_at.desc()).all()

@router.get("/latest", response_model=FarmResponse)
def get_latest_or_demo_farm(db: Session = Depends(get_db)):
    farm = db.query(Farm).order_by(Farm.created_at.desc()).first()
    if not farm:
        # Seed default demo farm: Faisalabad, Punjab, Pakistan
        farm = Farm(
            name="Al-Rehman Green Farm",
            location_name="Faisalabad, Pakistan",
            latitude=31.4504,
            longitude=73.1350,
            area=5.0,
            soil_type="Loamy",
            soil_ph=7.5,
            irrigation_type="Canal / Groundwater",
            current_crop="Wheat",
            priority="Soil Health"
        )
        db.add(farm)
        db.commit()
        db.refresh(farm)
    return farm

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm profile not found")
    return farm
