import { NextRequest, NextResponse } from "next/server";
import { fetchNasaPoint } from "@/lib/nasaService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("latitude") || searchParams.get("lat") || "31.4504";
  const lonStr = searchParams.get("longitude") || searchParams.get("lon") || "73.1350";

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  const data = await fetchNasaPoint(lat, lon);
  return NextResponse.json(data);
}
