from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Farm
from ..schemas import ChatRequest, ChatResponse
from ..services.nasa_service import fetch_nasa_power_data
from ..services.rotation_engine import generate_candidate_rotations
from ..services.ai_assistant import generate_explanation

router = APIRouter(prefix="/assistant", tags=["AI Agricultural Assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Answers farmer questions grounded on the farm's profile, registered fields,
    NASA observations, rotation engine scores, and What-if simulation context using Groq / LLM.
    """
    # 1. Fetch or construct farm info
    if req.farm_id:
        farm = db.query(Farm).filter(Farm.id == req.farm_id).first()
    else:
        farm = db.query(Farm).order_by(Farm.created_at.desc()).first()

    if not farm:
        farm_info = {
            "name": "Al-Rehman Green Farm",
            "location_name": "Faisalabad, Pakistan",
            "latitude": 31.4504,
            "longitude": 73.1350,
            "area": 30.0,
            "soil_type": "Loamy",
            "soil_ph": 7.5,
            "irrigation_type": "Canal / Groundwater",
            "current_crop": "Wheat",
            "priority": "Soil Health"
        }
        lat, lon = 31.4504, 73.1350
    else:
        farm_info = {
            "name": farm.name,
            "location_name": farm.location_name,
            "latitude": farm.latitude,
            "longitude": farm.longitude,
            "area": farm.area,
            "soil_type": farm.soil_type,
            "soil_ph": farm.soil_ph,
            "irrigation_type": farm.irrigation_type,
            "current_crop": farm.current_crop,
            "priority": farm.priority
        }
        lat, lon = farm.latitude, farm.longitude

    # 2. Merge live client farm context (e.g., registered fields, live coordinates) if sent
    if req.farm_context and isinstance(req.farm_context, dict):
        client_farm = req.farm_context.get("farm") or req.farm_context
        for k, v in client_farm.items():
            if v is not None and v != "":
                farm_info[k] = v
        if "latitude" in client_farm and "longitude" in client_farm:
            try:
                lat = float(client_farm["latitude"])
                lon = float(client_farm["longitude"])
            except (ValueError, TypeError):
                pass
        if "fields" in req.farm_context:
            farm_info["fields"] = req.farm_context["fields"]

    # 3. Fetch NASA climate data
    nasa_data = await fetch_nasa_power_data(lat, lon)
    env_summary = nasa_data.get("summary", {})

    # 4. Generate candidate rotations
    strategies = generate_candidate_rotations(
        current_crop=farm_info.get("current_crop", "Wheat"),
        soil_type=farm_info.get("soil_type", "Loamy"),
        soil_ph=float(farm_info.get("soil_ph", 7.5)),
        irrigation_type=farm_info.get("irrigation_type", "Canal / Groundwater"),
        priority=farm_info.get("priority", "Soil Health"),
        env_summary=env_summary
    )

    prompt_text = req.get_prompt_text()

    answer = await generate_explanation(
        prompt=prompt_text,
        farm_info=farm_info,
        nasa_summary=env_summary,
        strategies=strategies,
        simulation_context=req.simulation_context,
        api_key=req.api_key
    )

    return ChatResponse(prompt=prompt_text, response=answer, provider="groq")
