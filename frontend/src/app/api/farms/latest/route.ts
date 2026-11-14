import { NextResponse } from "next/server";
import { getLatestStoredFarm } from "@/lib/farmStore";

export async function GET() {
  const farm = getLatestStoredFarm();
  return NextResponse.json(farm);
}
