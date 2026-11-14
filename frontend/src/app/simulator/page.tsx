"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLatestFarm, simulateScenario } from "@/lib/api";
import { Farm, SimulationResult, SimulatedStrategy } from "@/lib/types";
import { 
  Sliders, 
  Thermometer, 
  CloudRain, 
  Droplets, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Bot,
  Zap
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";

export default function SimulatorPage() {
  const router = useRouter();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Scenario Sliders
  const [rainfallPct, setRainfallPct] = useState(-20);
  const [tempDelta, setTempDelta] = useState(2.0);
  const [waterPct, setWaterPct] = useState(-30);

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // Load initial farm
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const f = await getLatestFarm();
        setFarm(f);
        if (f.id) {
          const res = await simulateScenario(f.id, {
            rainfall_change_pct: -20,
            temperature_change_c: 2.0,
            water_change_pct: -30,
          });
          setSimulation(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const runSimulationUpdate = (rain: number, temp: number, water: number) => {
    if (!farm?.id) return;
    startTransition(async () => {
      try {
        const res = await simulateScenario(farm.id!, {
          rainfall_change_pct: rain,
          temperature_change_c: temp,
          water_change_pct: water,
        });
        setSimulation(res);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const applyPreset = (rain: number, temp: number, water: number) => {
    setRainfallPct(rain);
    setTempDelta(temp);
    setWaterPct(water);
    runSimulationUpdate(rain, temp, water);
  };

  const handleAskAIAboutScenario = () => {
    if (typeof window !== "undefined" && simulation) {
      sessionStorage.setItem("agroshift_sim_context", JSON.stringify(simulation));
      router.push("/assistant?fromSim=true");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 animate-spin">
          <Sliders className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Initializing What-If Scenario Matrix...</h2>
        <p className="text-sm text-slate-500 mt-1">Simulating climate stress against crop biological resilience bounds</p>
      </div>
    );
  }

  // Comparison chart data
  const chartData = (simulation?.strategies || []).map((s) => ({
    name: s.strategy_name.split("&")[0].trim(),
    Baseline: s.baseline_score,
    Stressed: s.simulated_score,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-slate-50/50">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Module 4: Signature What-If Scenario Simulator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Climate Stress & Resource Shock Simulator
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Evaluate how extreme weather and canal water cuts alter the relative suitability of each crop rotation sequence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAskAIAboutScenario}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI To Explain This Shift</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulator Control Sliders & Presets */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Adjust Environmental Stress Parameters
            </h2>
            <span className="text-xs text-slate-500">
              Sliders immediately re-compute rotation scores using physiological tolerance bounds
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset(0, 0, 0)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Baseline (0%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-20, 1.5, -15)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-colors"
            >
              Moderate Drought (-20%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-30, 3.0, -30)}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              🔥 Heat Wave & Water Shock (-30%, +3°C)
            </button>
          </div>
        </div>

        {/* The 3 Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Rainfall */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-600" />
                NASA Rainfall Deficit
              </span>
              <span className={`font-mono font-bold ${rainfallPct < 0 ? "text-blue-600" : "text-slate-700"}`}>
                {rainfallPct > 0 ? `+${rainfallPct}` : rainfallPct}%
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="20"
              step="5"
              value={rainfallPct}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setRainfallPct(val);
                runSimulationUpdate(val, tempDelta, waterPct);
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-40% (Severe)</span>
              <span>0% (Historical)</span>
              <span>+20%</span>
            </div>
          </div>

          {/* Slider 2: Temperature */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-orange-500" />
                Temperature Anomaly
              </span>
              <span className="font-mono font-bold text-orange-600">
                +{tempDelta.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="4.0"
              step="0.5"
              value={tempDelta}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTempDelta(val);
                runSimulationUpdate(rainfallPct, val, waterPct);
              }}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.0°C (Normal)</span>
              <span>+2.0°C</span>
              <span>+4.0°C (Extreme Heat)</span>
            </div>
          </div>

          {/* Slider 3: Irrigation Access */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-indigo-600" />
                Canal / Groundwater Cut
              </span>
              <span className={`font-mono font-bold ${waterPct < 0 ? "text-indigo-600" : "text-slate-700"}`}>
                {waterPct > 0 ? `+${waterPct}` : waterPct}%
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="20"
              step="5"
              value={waterPct}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setWaterPct(val);
                runSimulationUpdate(rainfallPct, tempDelta, val);
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-40% (Canal Rationing)</span>
              <span>0% (Nominal)</span>
              <span>+20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Rank Flip Banner */}
      {simulation?.winner_changed ? (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-start gap-3.5 shadow-sm">
          <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900">
              ⚡ Strategy Ranking Shift Detected!
            </h3>
            <p className="text-xs text-amber-800">
              {simulation.takeaway}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3 text-xs text-slate-700">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-blue-900">Resilience Stability:</strong> {simulation?.takeaway}
          </div>
        </div>
      )}

      {/* Comparative Cards & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Strategy Comparison Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Simulated Suitability vs Baseline
          </h2>

          <div className="space-y-4">
            {(simulation?.strategies || []).map((s, idx) => {
              const isWinner = s.simulated_rank === 1;
              const hasDroppedRank = s.rank_shift < 0;
              const hasClimbedRank = s.rank_shift > 0;

              return (
                <div
                  key={s.strategy_key}
                  className={`p-5 rounded-2xl border transition-all bg-white ${
                    isWinner
                      ? "border-2 border-blue-600 shadow-md shadow-blue-500/10"
                      : "border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            isWinner
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          Rank #{s.simulated_rank}
                        </span>

                        {hasClimbedRank && (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-3.5 h-3.5" /> Climbed +{s.rank_shift}
                          </span>
                        )}

                        {hasDroppedRank && (
                          <span className="text-[11px] text-rose-600 font-bold flex items-center gap-0.5">
                            <TrendingDown className="w-3.5 h-3.5" /> Dropped {s.rank_shift}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 tracking-tight pt-1">
                        {s.strategy_name}
                      </h3>
                      <div className="text-xs text-blue-700 font-semibold">
                        {s.crop_sequence}
                      </div>
                    </div>

                    {/* Scores Comparison */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-2xl font-black text-slate-900">{s.simulated_score}</span>
                        <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                      </div>
                      <div className="text-[11px] flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-slate-500">Base: {s.baseline_score}</span>
                        <span
                          className={`font-bold ${
                            s.delta < 0 ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          ({s.delta > 0 ? `+${s.delta}` : s.delta})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Insight note */}
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <strong className="text-slate-900">Resilience Driver:</strong> {s.insight}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Comparative Visual Bar Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Baseline vs. Stressed Comparison
          </h2>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="h-[300px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[40, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "0.5rem", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Bar dataKey="Baseline" fill="#2563eb" radius={[4, 4, 0, 0]} name="Baseline (0%)" />
                  <Bar dataKey="Stressed" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Stressed Scenario" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
              💡 <strong>Key Hackathon Demonstration Tip:</strong> Notice how high-water rotations experience steep penalties during simulated water shortages, while Sorghum and Chickpea exhibit biological buffering capacity.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
