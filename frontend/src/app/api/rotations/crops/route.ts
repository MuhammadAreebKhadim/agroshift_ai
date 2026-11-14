import { NextResponse } from "next/server";
import { CROP_DATABASE } from "@/lib/cropMatrix";

export async function GET() {
  const cropList = Object.values(CROP_DATABASE);
  return NextResponse.json({
    count: cropList.length,
    crops: cropList,
  });
}
