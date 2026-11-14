from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location_name = Column(String(150), default="Unknown Location")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area = Column(Float, default=5.0)  # acres
    soil_type = Column(String(50), default="Loamy")  # Loamy, Clay, Sandy, Sandy-Loam, Clay-Loam
    soil_ph = Column(Float, default=7.5)
    irrigation_type = Column(String(50), default="Canal / Groundwater") # Canal, Groundwater, Rainfed, Drip
    current_crop = Column(String(50), default="Wheat")
    priority = Column(String(50), default="Soil Health")  # Soil Health, Water Conservation, Yield/Profit
    created_at = Column(DateTime, default=datetime.utcnow)

    environmental_records = relationship("EnvironmentalData", back_populates="farm", cascade="all, delete-orphan")
    rotation_strategies = relationship("RotationStrategy", back_populates="farm", cascade="all, delete-orphan")
    simulation_results = relationship("SimulationResult", back_populates="farm", cascade="all, delete-orphan")


class EnvironmentalData(Base):
    __tablename__ = "environmental_data"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    date = Column(String(20), nullable=False) # YYYYMMDD
    temperature = Column(Float)         # T2M (°C)
    max_temperature = Column(Float)     # T2M_MAX (°C)
    min_temperature = Column(Float)     # T2M_MIN (°C)
    precipitation = Column(Float)       # PRECTOTCORR (mm/day)
    solar_radiation = Column(Float)     # ALLSKY_SFC_SW_DWN (MJ/m^2/day or kWh/m^2/day)

    farm = relationship("Farm", back_populates="environmental_records")


class RotationStrategy(Base):
    __tablename__ = "rotation_strategies"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    strategy_key = Column(String(50), nullable=False)  # strategy_a, strategy_b, strategy_c
    strategy_name = Column(String(100), nullable=False) # e.g. "Soil Rejuvenation Cycle"
    crop_sequence = Column(String(200), nullable=False) # e.g. "Wheat -> Chickpea -> Maize"
    objective = Column(String(100), nullable=False)
    climate_score = Column(Float, default=0.0)
    water_score = Column(Float, default=0.0)
    soil_score = Column(Float, default=0.0)
    priority_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    explanation = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="rotation_strategies")
    simulations = relationship("SimulationResult", back_populates="strategy", cascade="all, delete-orphan")


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    strategy_id = Column(Integer, ForeignKey("rotation_strategies.id"), nullable=False)
    rainfall_change = Column(Float, default=0.0)     # e.g. -20.0 (%)
    temperature_change = Column(Float, default=0.0)  # e.g. +2.0 (°C)
    water_change = Column(Float, default=0.0)        # e.g. -30.0 (%)
    baseline_score = Column(Float, default=0.0)
    new_score = Column(Float, default=0.0)
    score_delta = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="simulation_results")
    strategy = relationship("RotationStrategy", back_populates="simulations")
