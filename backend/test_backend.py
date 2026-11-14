import sys
import io
import asyncio

# Fix Windows console utf-8 encoding for arrows/emojis
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from app.database import engine, Base, SessionLocal
from app.models import Farm
from app.services.nasa_service import fetch_nasa_power_data
from app.services.rotation_engine import generate_candidate_rotations
from app.services.simulator import run_simulation
from app.services.ai_assistant import generate_explanation

async def main():
    print("--- 1. Testing Database & Farm Creation ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    farm = db.query(Farm).first()
    if not farm:
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
    print(f"Farm created/loaded: ID={farm.id}, Name={farm.name}, Lat={farm.latitude}, Lon={farm.longitude}")

    print("\n--- 2. Testing NASA POWER Service ---")
    nasa_data = await fetch_nasa_power_data(farm.latitude, farm.longitude)
    print(f"NASA Source: {nasa_data['source']}")
    print(f"Avg Temp: {nasa_data['summary']['avg_temperature']}°C")
    print(f"Total Rainfall: {nasa_data['summary']['total_precipitation']} mm")
    print(f"Heat Stress Days (>35°C): {nasa_data['summary']['heat_stress_days']}")
    print(f"Daily points count: {len(nasa_data['daily_data'])}")

    print("\n--- 3. Testing Crop Rotation Engine ---")
    strategies = generate_candidate_rotations(
        current_crop=farm.current_crop,
        soil_type=farm.soil_type,
        soil_ph=farm.soil_ph,
        irrigation_type=farm.irrigation_type,
        priority=farm.priority,
        env_summary=nasa_data["summary"]
    )
    for s in strategies:
        print(f"[{s['overall_score']}/100] {s['strategy_name']} -> {s['crop_sequence']}")
        print(f"     Subscores: Climate={s['scores']['climate']}, Water={s['scores']['water']}, Soil={s['scores']['soil']}, Priority={s['scores']['priority']}")

    print("\n--- 4. Testing What-If Simulator ---")
    sim_result = run_simulation(
        current_crop=farm.current_crop,
        soil_type=farm.soil_type,
        soil_ph=farm.soil_ph,
        irrigation_type=farm.irrigation_type,
        priority=farm.priority,
        env_summary=nasa_data["summary"],
        rainfall_change_pct=-20.0,
        temperature_change_c=2.0,
        water_change_pct=-30.0
    )
    print(f"Scenario: {sim_result['scenario']['description']}")
    print(f"Winner changed? {sim_result['winner_changed']}")
    print(f"Takeaway: {sim_result['takeaway']}")
    for st in sim_result["strategies"]:
        print(f"  {st['strategy_name']}: Baseline={st['baseline_score']} -> Simulated={st['simulated_score']} (Delta: {st['delta']}) | Rank: {st['baseline_rank']} -> {st['simulated_rank']}")

    print("\n--- 5. Testing AI Assistant ---")
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
    answer = await generate_explanation(
        prompt="Why is Strategy B better under limited water?",
        farm_info=farm_info,
        nasa_summary=nasa_data["summary"],
        strategies=strategies,
        simulation_context=sim_result
    )
    print(f"AI Assistant Response Preview:\n{answer[:300]}...\n")
    print("ALL BACKEND MODULES VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
