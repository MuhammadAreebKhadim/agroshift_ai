from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routes import farms, nasa, rotations, simulator, assistant

# Create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AgroShift AI: NASA Earth Intelligence-driven Crop Rotation & Scenario Simulator API"
)

# Enable CORS for Next.js and Cloud frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(farms.router, prefix=settings.API_V1_STR)
app.include_router(nasa.router, prefix=settings.API_V1_STR)
app.include_router(rotations.router, prefix=settings.API_V1_STR)
app.include_router(simulator.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "online",
        "docs_url": "/docs",
        "endpoints": [
            f"{settings.API_V1_STR}/farms",
            f"{settings.API_V1_STR}/nasa",
            f"{settings.API_V1_STR}/rotations",
            f"{settings.API_V1_STR}/simulator",
            f"{settings.API_V1_STR}/assistant"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
