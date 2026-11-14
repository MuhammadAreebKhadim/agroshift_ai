import { NextRequest, NextResponse } from "next/server";
import { fetchNasaPoint } from "@/lib/nasaService";

export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  // Use standard Faisalabad coordinates for default farm
  const data = await fetchNasaPoint(31.4504, 73.1350);
  return NextResponse.json(data);
}
