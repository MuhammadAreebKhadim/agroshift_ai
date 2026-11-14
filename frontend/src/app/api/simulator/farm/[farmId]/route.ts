import { NextRequest, NextResponse } from "next/server";
import { runSimulation } from "@/lib/rotationEngine";
import { fetchNasaPoint } from "@/lib/nasaService";

export async function POST(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    const body = await req.json();
    const rainfallChangePct = parseFloat(body.rainfall_change_pct ?? 0);
    const temperatureChangeC = parseFloat(body.temperature_change_c ?? 0);
    const waterChangePct = parseFloat(body.water_change_pct ?? 0);

    const nasaData = await fetchNasaPoint(31.4504, 73.1350);
    const result = runSimulation(
      "Wheat",
      "Loamy",
      7.5,
      "Canal / Groundwater",
      "Soil Health",
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
