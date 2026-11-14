import { NextRequest, NextResponse } from "next/server";
import { generateCandidateRotations } from "@/lib/rotationEngine";
import { fetchNasaPoint } from "@/lib/nasaService";

export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  const nasaData = await fetchNasaPoint(31.4504, 73.1350);
  const strategies = generateCandidateRotations(
    "Wheat",
    "Loamy",
    7.5,
    "Canal / Groundwater",
    "Soil Health",
    nasaData.summary
  );

  return NextResponse.json(strategies);
}
