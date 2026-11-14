# AgroShift AI 🌾🛰️
> **NASA Space Apps Challenge 2026**  
> *Transforming NASA Earth Observations into Resilient Crop Rotations & Climate Stress Simulations*

---

## 🌟 Executive Summary

Traditional agricultural apps suggest only a single, isolated crop based on basic NPK soil tests. **AgroShift AI** pioneers a multi-season crop rotation decision-support engine powered by **NASA POWER Earth Observations**, deterministic agronomic scoring, and an interactive **What-If Climate Stress Simulator**.

### Key Differentiators for Hackathon Judges
| Conventional Crop Apps | AgroShift AI |
| :--- | :--- |
| Recommends an isolated single crop | Evaluates **multi-season crop rotation sequences** (e.g. Wheat → Legumes → Maize) |
| Uses only basic soil test numbers | Integrates **365-day NASA POWER satellite & meteorological observations** |
| Mystery blackbox recommendation | **100% transparent formula**: 30% Climate + 25% Water + 25% Soil + 20% Priority |
| Static, one-time output | **Signature What-If Simulator**: Live recalculation under -30% rain and +3°C heat |
| Generic LLM hallucinations | **Grounded AI Explainer**: Strictly constrained to NASA data and calculated engine metrics |

---

## 📐 System Architecture

```
FARMER / EXTENSION OFFICER
           │
           ▼
    NEXT.JS FRONTEND (React 18, Tailwind CSS, Recharts, Leaflet OpenStreetMap)
   ┌─────────────────────────────────────────────────────────────────┐
   │ 1. /farm-setup       - Interactive Leaflet coordinate & soil UI │
   │ 2. /dashboard        - NASA POWER Earth Observation KPI cards   │
   │ 3. /rotation-planner - 3 Candidate strategies & formula drawer  │
   │ 4. /simulator        - Signature What-If Climate Stress Sliders │
   │ 5. /assistant        - Grounded AI Explainer (Gemini API)       │
   └────────────────────────────────┬────────────────────────────────┘
                                    │ REST API
                                    ▼
       FASTAPI BACKEND (Python 3.14 / 3.11, SQLite, SQLAlchemy, Pydantic)
   ┌─────────────────────────────────────────────────────────────────┐
   │  • NASA POWER API Client (Daily PRECTOTCORR, T2M, ALLSKY Solar) │
   │  • Climatological Derived Indicators (Heat Stress, Dry Spells)  │
   │  • Deterministic Rotation Scoring Engine (12 FAO/PARC crops)    │
   │  • What-If Parametric Shock Recalculator                        │
   │  • AI Assistant Pipeline (Google Gemini 2.5 Flash)              │
   └─────────────────────────────────────────────────────────────────┘
```

---

## 🛰️ NASA POWER API Integration

AgroShift AI directly queries the **NASA Prediction of Worldwide Energy Resources (POWER)** Agroclimatology dataset for any point on Earth:
- **`PRECTOTCORR`**: Corrected daily precipitation (mm/day)
- **`T2M`**: Temperature at 2 meters above ground (°C)
- **`T2M_MAX` & `T2M_MIN`**: Daily maximum and minimum temperatures
- **`ALLSKY_SFC_SW_DWN`**: All-sky surface downward solar irradiance ($MJ/m^2/day$)

### Derived Agronomic Intelligence
Instead of merely graphing raw lines, AgroShift converts NASA measurements into actionable agronomic indicators:
1. **Heat Stress Days ($T_{\max} \ge 35^\circ\text{C}$)**: Identifies heat spikes during critical flowering/silking phases.
2. **Seasonal Water Balance**: Rabi (Winter) vs. Kharif (Monsoon/Summer) precipitation totals compared against crop evapotranspiration.
3. **Dry Spell Streaks**: Maximum consecutive rainless days ($<1.0\text{ mm}$) to evaluate pulse drought resilience.
4. **Photosynthetic Potential**: Seasonal solar insolation index.

*Scientific Note: NASA POWER provides meteorological and solar observations. Soil texture, pH, and irrigation capacity are farmer field-verified inputs.*

---

## 🌾 The 12-Crop Knowledge Matrix

Documented agronomic properties compiled from **FAO**, **PARC (Pakistan Agricultural Research Council)**, and **NARC**:

1. **Wheat** *(Triticum aestivum)*: Rabi staple cereal (350–450 mm water, 15–25°C opt).
2. **Chickpea** *(Cicer arietinum)*: Rabi nitrogen-fixing pulse (200–300 mm water, fixes 40–70 kg N/ha, deep taproot).
3. **Lentils** *(Lens culinaris)*: Rabi low-water pulse (180–250 mm water, fixes 35–55 kg N/ha).
4. **Maize** *(Zea mays)*: Kharif high-yield cereal (500–650 mm water, high fertilizer feeder).
5. **Sorghum** *(Sorghum bicolor)*: Kharif drought-resilient C4 cereal/fodder (300–450 mm water, heat tolerant up to 42°C).
6. **Berseem** *(Trifolium alexandrinum)*: Rabi legume "King of Fodders" (fixes 100+ kg N/ha, 4–6 multicut harvests).
7. **Cotton** *(Gossypium hirsutum)*: Kharif industrial cash crop (600–750 mm water).
8. **Rice** *(Oryza sativa)*: Kharif staple cereal (900–1300 mm water).
9. **Soybean** *(Glycine max)*: Kharif high-protein pulse/oilseed (fixes 70–100 kg N/ha).
10. **Mustard / Canola** *(Brassica juncea)*: Rabi short-season oilseed with natural biofumigation.
11. **Mung Bean** *(Vigna radiata)*: 60-day summer catch pulse (150–250 mm water).
12. **Pearl Millet** *(Pennisetum glaucum)*: Kharif extreme heat & drought endurance cereal.

---

## ⚖️ Transparent Scoring Formula

No opaque blackbox logic. Every rotation sequence is scored from 0 to 100 using:

$$\text{Rotation Score} = 0.30 \times S_{\text{Climate}} + 0.25 \times S_{\text{Water}} + 0.25 \times S_{\text{Soil}} + 0.20 \times S_{\text{Priority}}$$

- **$S_{\text{Climate}}$ (30%)**: Thermal envelope compatibility, heat stress days penalty, and frost risk penalty.
- **$S_{\text{Water}}$ (25%)**: Ratio of available water (NASA rain + farmer irrigation turns) vs. cumulative sequence water demand.
- **$S_{\text{Soil}}$ (25%)**: Soil texture compatibility and quadratic deviation from optimal soil pH.
- **$S_{\text{Priority}}$ (20%)**: Operational goal weighting (Soil Health rewards N-fixation; Water Conservation rewards drought tolerance; Yield rewards high cash value).

---

## ⚡ The Signature What-If Simulator

The signature feature of AgroShift AI allows farmers and judges to stress-test rotation resilience:
- **Rainfall Shift**: $0\%, -10\%, -20\%, -30\%$
- **Temperature Anomaly**: $0^\circ\text{C}, +1^\circ\text{C}, +2^\circ\text{C}, +3^\circ\text{C}$
- **Canal / Groundwater Availability**: $0\%, -10\%, -20\%, -30\%$

**The Demonstration Moment**:
- Under baseline conditions, **Strategy A (Wheat → Chickpea → Maize)** is Rank #1 (84 pts).
- When a $-30\%$ rainfall cut and $+3^\circ\text{C}$ heat wave are applied, Maize suffers severe heat and moisture stress, dropping Strategy A by 12 points.
- **Strategy B (Wheat → Sorghum → Chickpea)** drops by only 2 points and **climbs to Rank #1 (81.4 pts)** because Sorghum is a C4 plant and Chickpea requires 50% less water!

---

## 🚀 Quick Start (Local Run)

### 1. Launch with 1-Click
Double-click `run_local.bat` (or execute `.\run_local.ps1` in PowerShell).

### 2. Manual Launch
**Backend**:
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

Open:
- **Frontend App**: `http://localhost:3000`
- **FastAPI Interactive Docs**: `http://127.0.0.1:8000/docs`

---

## ☁️ Deployment Guide

### Deploy Backend to Render or Railway
1. **Render (1-Click Blueprint)**:
   - Connect your GitHub repo on [render.com](https://render.com).
   - Render automatically reads `backend/render.yaml` and deploys your FastAPI service.
   - Set `GEMINI_API_KEY` in Render environment variables.
2. **Railway**:
   - Run `railway up` from the `backend/` folder or import via GitHub.
   - Railway uses `backend/Procfile` or `backend/Dockerfile`.

### Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select the `frontend` root directory.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-app.onrender.com/api`
4. Click **Deploy**! Live in under 60 seconds.

---

## 🏆 Presentation Walkthrough for Judges (3-Minute Script)

1. **Step 1: Open AgroShift AI (`/`)**: Show the NASA Space Apps banner and explain that we solve the crop rotation puzzle, not just single-crop guesswork.
2. **Step 2: Farm Setup (`/farm-setup`)**: Click the **"Faisalabad, Pakistan"** preset. Show the interactive Leaflet map and soil inputs (pH 7.5, Loamy soil). Click *Save Farm*.
3. **Step 3: NASA Earth Intelligence (`/dashboard`)**: Show the live NASA POWER observations (504 mm rain, 184 heat stress days, 79-day dry spell streak) and the interactive Recharts temperature/precipitation charts.
4. **Step 4: Rotation Planner (`/rotation-planner`)**: Showcase the 3 candidate strategies with transparent score cards. Click **"Inspect Scoring Formula"** to show judges the deterministic math behind the rankings.
5. **Step 5: What-If Simulator (`/simulator`)**: Move the Rainfall slider to **-30%** and Temperature to **+3°C**. Show the instant rank reshuffle where **Strategy B (Water-Conscious)** takes Rank #1!
6. **Step 6: AI Assistant (`/assistant`)**: Click the prompt *"Why is Strategy B better under limited rainfall?"* and watch the grounded AI explain the C4 physiology of Sorghum and biological nitrogen fixation of Chickpea.

---

Built with ❤️ for sustainable agriculture and global food security.
