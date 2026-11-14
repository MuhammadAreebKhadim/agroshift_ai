import { NextRequest, NextResponse } from "next/server";
import { runSimulation } from "@/lib/rotationEngine";
import { fetchNasaPoint } from "@/lib/nasaService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rainfallChangePct = parseFloat(body.rainfall_change_pct ?? 0);
    const temperatureChangeC = parseFloat(body.temperature_change_c ?? 0);
    const waterChangePct = parseFloat(body.water_change_pct ?? 0);

    const currentCrop = body.current_crop || "Wheat";
    const soilType = body.soil_type || "Loamy";
    const soilPh = parseFloat(body.soil_ph ?? 7.5);
    const irrigationType = body.irrigation_type || "Canal / Groundwater";
    const priority = body.priority || "Soil Health";

    const lat = parseFloat(body.latitude ?? 31.4504);
    const lon = parseFloat(body.longitude ?? 73.1350);

    const nasaData = await fetchNasaPoint(lat, lon);
    const result = runSimulation(
      currentCrop,
      soilType,
      soilPh,
      irrigationType,
      priority,
      nasaData.summary,
      rainfallChangePct,
      temperatureChangeC,
      waterChangePct
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Simulation failed" }, { status: 400 });
  }
}
