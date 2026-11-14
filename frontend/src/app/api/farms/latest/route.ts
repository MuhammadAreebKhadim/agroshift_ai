import { NextResponse } from "next/server";

export async function GET() {
  const defaultFarm = {
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
  };

  return NextResponse.json(defaultFarm);
}
