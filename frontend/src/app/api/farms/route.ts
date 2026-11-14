import { NextRequest, NextResponse } from "next/server";

let farmsDb: any[] = [
  {
    id: 1,
    name: "Al-Rehman Green Farm",
    location_name: "Faisalabad, Pakistan",
    latitude: 31.4504,
    longitude: 73.1350,
    area: 30.0,
    soil_type: "Loamy",
    soil_ph: 7.5,
    irrigation_type: "Canal / Groundwater",
    current_crop: "Wheat",
    priority: "Soil Health",
    created_at: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(farmsDb);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newFarm = {
      ...body,
      id: farmsDb.length + 1,
      created_at: new Date().toISOString(),
    };
    farmsDb.unshift(newFarm);
    return NextResponse.json(newFarm, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid payload" }, { status: 400 });
  }
}
