import { NextRequest, NextResponse } from "next/server";
import { globalFarmsDb, addStoredFarm } from "@/lib/farmStore";

export async function GET() {
  return NextResponse.json(globalFarmsDb);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newFarm = addStoredFarm(body);
    return NextResponse.json(newFarm, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid payload" }, { status: 400 });
  }
}
