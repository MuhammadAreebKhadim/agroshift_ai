import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    platform: "Vercel Edge / Serverless Engine",
    service: "AgroShift AI Core API",
  });
}
