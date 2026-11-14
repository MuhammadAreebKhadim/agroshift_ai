"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLatestFarm, getRotationsForFarm } from "@/lib/api";
import { Farm, Strategy } from "@/lib/types";
import { 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Droplets, 
  Sprout, 
  ArrowRight, 
  HelpCircle,
  Sparkles,
  Layers
} from "lucide-react";

export default function RotationPlannerPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const f = await getLatestFarm();
        setFarm(f);
        if (f.id) {
          const strats = await getRotationsForFarm(f.id);
          setStrategies(strats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 animate-spin">
          <RotateCw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Synthesizing Rotation Strategies...</h2>
        <p className="text-sm text-slate-500 mt-1">Cross-referencing soil compatibility, NASA climate history, and crop water footprints</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Module 3: Crop Rotation Recommendation Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Evaluated Candidate Rotation Sequences
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Deterministic agricultural scoring based on <span className="text-blue-700 font-semibold">{farm?.name}</span>&apos;s 
            soil conditions and NASA POWER meteorological data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-blue-400 text-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>{showFormula ? "Hide Formula" : "Inspect Scoring Formula"}</span>
          </button>

          <Link
            href="/simulator"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <Sliders className="w-4 h-4 text-slate-950" />
            <span>Stress Test in Simulator</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:scale-105 transition-all"
          >
            <span>Generate Farm Report</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Transparent Scoring Formula Banner (Expandable) */}
      {showFormula && (
        <div className="p-5 rounded-2xl bg-white border-2 border-blue-500 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Transparent Agronomic Scoring Formula
            </span>
            <span className="text-xs text-slate-500 font-semibold">100% Deterministic • Non-Blackbox</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-sm font-mono text-blue-900 font-bold overflow-x-auto">
            Rotation Score = (0.30 × Climate Suitability) + (0.25 × Water Balance) + (0.25 × Soil Compatibility) + (0.20 × Priority Alignment)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-1">
            <div><strong className="text-slate-900">Climate (30%):</strong> Temperature matching, heat stress days & frost risk.</div>
            <div><strong className="text-slate-900">Water (25%):</strong> NASA rain + irrigation vs crop evapotranspiration.</div>
            <div><strong className="text-slate-900">Soil (25%):</strong> Soil texture match & pH tolerance curve.</div>
            <div><strong className="text-slate-900">Priority (20%):</strong> Bonus for matching soil health, water thrift, or cash yield.</div>
          </div>
        </div>
      )}

      {/* Strategy Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {strategies.map((strat, idx) => {
          const isRank1 = idx === 0;
          return (
            <div
              key={strat.strategy_key}
              className={`rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all bg-white border ${
                isRank1
                  ? "border-2 border-blue-600 shadow-lg shadow-blue-500/10"
                  : "border-slate-200 shadow-sm"
              }`}
            >
              <div className="space-y-4">
                {/* Card Top: Rank & Overall Score */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isRank1
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    Rank #{idx + 1} {isRank1 && "• Recommended"}
                  </span>

                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900">{strat.overall_score}</span>
                    <span className="text-xs text-slate-400 font-semibold"> / 100</span>
                  </div>
                </div>

                {/* Strategy Title & Objective */}
                <div>
                  <h3 className="text-lg font-bold text-slate-950 tracking-tight">{strat.strategy_name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{strat.objective}</p>
                </div>

                {/* Crop Sequence Flow */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Crop Rotation Sequence
                  </div>
                  <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-blue-700">
                    {strat.crops_list.map((c, cIdx) => (
                      <span key={cIdx} className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                          {c}
                        </span>
                        {cIdx < strat.crops_list.length - 1 && (
                          <span className="text-blue-400 font-black">➔</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subscores Breakdown Bars */}
                <div className="space-y-2.5 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Scoring Breakdown
                  </div>
                  
                  {/* Climate */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Climate Suitability (30%)</span>
                      <span className="font-bold text-slate-900">{strat.scores.climate}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${strat.scores.climate}%` }} />
                    </div>
                  </div>

                  {/* Water */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Water Balance (25%)</span>
                      <span className="font-bold text-slate-900">{strat.scores.water}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${strat.scores.water}%` }} />
                    </div>
                  </div>

                  {/* Soil */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Soil Compatibility (25%)</span>
                      <span className="font-bold text-slate-900">{strat.scores.soil}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${strat.scores.soil}%` }} />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Priority Alignment (20%)</span>
                      <span className="font-bold text-slate-900">{strat.scores.priority}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${strat.scores.priority}%` }} />
                    </div>
                  </div>
                </div>

                {/* Footprint & N-Fixation Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="text-[10px] text-blue-600 font-medium">Water Footprint</div>
                    <div className="font-bold text-blue-900 flex items-center gap-1 mt-0.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>{strat.water_footprint_mm} mm</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-700 font-medium">Biological N Fix</div>
                    <div className="font-bold text-emerald-900 flex items-center gap-1 mt-0.5">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+{strat.nitrogen_balance_kg_ha} kg N/ha</span>
                    </div>
                  </div>
                </div>

                {/* Pros & Risks */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Advantages
                    </div>
                    <ul className="text-slate-700 space-y-1 pl-4 list-disc text-[11px]">
                      {strat.pros.slice(0, 2).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="font-bold text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Considerations & Risks
                    </div>
                    <ul className="text-slate-600 space-y-1 pl-4 list-disc text-[11px]">
                      {strat.risks.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom CTA to Simulator */}
              <Link
                href="/simulator"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-all"
              >
                <span>Stress-Test in What-If Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
