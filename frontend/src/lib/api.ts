import { Farm, NASADataResponse, Strategy, SimulationResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function getFarms(): Promise<Farm[]> {
  const res = await fetch(`${API_BASE}/farms/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch farms");
  return res.json();
}

export async function getLatestFarm(): Promise<Farm> {
  const res = await fetch(`${API_BASE}/farms/latest`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch latest farm");
  return res.json();
}

export async function createFarm(data: Omit<Farm, "id" | "created_at">): Promise<Farm> {
  const res = await fetch(`${API_BASE}/farms/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to register farm");
  return res.json();
}

export async function getNasaDataForFarm(farmId: number): Promise<NASADataResponse> {
  const res = await fetch(`${API_BASE}/nasa/farm/${farmId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch NASA data for farm");
  return res.json();
}

export async function getNasaPointData(lat: number, lon: number): Promise<NASADataResponse> {
  const res = await fetch(`${API_BASE}/nasa/point?latitude=${lat}&longitude=${lon}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch NASA point data");
  return res.json();
}

export async function getRotationsForFarm(farmId: number): Promise<Strategy[]> {
  const res = await fetch(`${API_BASE}/rotations/farm/${farmId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch crop rotations");
  return res.json();
}

export async function getCropMatrix(): Promise<{ count: number; crops: any[] }> {
  const res = await fetch(`${API_BASE}/rotations/crops`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch crop matrix");
  return res.json();
}

export async function simulateScenario(
  farmId: number | undefined,
  params: {
    rainfall_change_pct: number;
    temperature_change_c: number;
    water_change_pct: number;
  }
): Promise<SimulationResult> {
  const url = farmId ? `${API_BASE}/simulator/farm/${farmId}` : `${API_BASE}/simulator/simulate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to run simulation");
  return res.json();
}

export async function sendChatMessage(
  prompt: string,
  farmId?: number,
  simulationContext?: any,
  farmContext?: any
): Promise<{ prompt: string; response: string; provider?: string }> {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      farm_id: farmId,
      simulation_context: simulationContext,
      farm_context: farmContext,
    }),
  });
  if (!res.ok) throw new Error("Failed to send message to assistant");
  return res.json();
}
