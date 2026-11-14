"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLatestFarm, getNasaDataForFarm, getRotationsForFarm } from "@/lib/api";
import { Farm, NASADataResponse, Strategy } from "@/lib/types";
import { 
  FileText, 
  Printer, 
  Satellite, 
  Sprout, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Download,
  Calendar,
  Layers,
  Thermometer,
  CloudRain
} from "lucide-react";

export default function FarmReportPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [nasa, setNasa] = useState<NASADataResponse | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const f = await getLatestFarm();
        setFarm(f);
        if (f.id) {
          const [nData, strats] = await Promise.all([
            getNasaDataForFarm(f.id),
            getRotationsForFarm(f.id)
          ]);
          setNasa(nData);
          setStrategies(strats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-900">Synthesizing Official Farm Action Report...</h2>
        <p className="text-xs text-slate-500 mt-1">Grounded in NASA POWER agroclimatology observations</p>
      </div>
    );
  }

  const summary = nasa?.summary;
  const bestStrat = strategies[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="print:hidden flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          href="/rotation-planner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rotation Planner</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-900 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛰️</span>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">AgroShift AI</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Official Farm Action Plan</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Decision-Support Report • NASA Space Apps Challenge 2026
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div><strong>Report Date:</strong> {new Date().toLocaleDateString()}</div>
            <div><strong>Verification:</strong> NASA POWER Satellite Ingestion</div>
          </div>
        </div>

        {/* 1. Farm Profile */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span>1. Field & Operator Profile</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Farm Name</span>
              <strong className="text-slate-900">{farm?.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Location</span>
              <strong className="text-slate-900">{farm?.location_name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">GPS Coordinates</span>
              <strong className="text-slate-900">{farm?.latitude.toFixed(4)}° N, {farm?.longitude.toFixed(4)}° E</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Field Area</span>
              <strong className="text-slate-900">{farm?.area} Acres</strong>
            </div>
          </div>
        </div>

        {/* 2. Soil & Infrastructure */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            2. Soil Characteristics & Water Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Soil Texture</span>
              <strong className="text-slate-900">{farm?.soil_type}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Soil pH</span>
              <strong className="text-slate-900">{farm?.soil_ph} pH</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Irrigation Type</span>
              <strong className="text-slate-900">{farm?.irrigation_type}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Farming Priority</span>
              <strong className="text-slate-900">{farm?.priority}</strong>
            </div>
          </div>
        </div>

        {/* 3. NASA Observations */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>3. NASA POWER Earth Observations</span>
            <span className="text-[10px] text-blue-700 font-semibold lowercase">Source: power.larc.nasa.gov</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
            <div>
              <span className="text-slate-600 block">Mean Temperature (T2M)</span>
              <strong className="text-blue-900 text-base">{summary?.avg_temperature}°C</strong>
            </div>
            <div>
              <span className="text-slate-600 block">Total Annual Rainfall</span>
              <strong className="text-blue-900 text-base">{summary?.total_precipitation} mm</strong>
            </div>
            <div>
              <span className="text-slate-600 block">Heat Stress Days (&gt;35°C)</span>
              <strong className="text-rose-700 text-base">{summary?.heat_stress_days} Days</strong>
            </div>
            <div>
              <span className="text-slate-600 block">Longest Dry Spell</span>
              <strong className="text-amber-800 text-base">{summary?.longest_dry_spell_days} Days</strong>
            </div>
          </div>
        </div>

        {/* 4. Three Candidate Rotations */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            4. Evaluated Crop Rotation Alternatives
          </h2>
          <div className="space-y-3">
            {strategies.map((strat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                      Rank #{idx + 1}
                    </span>
                    <strong className="text-sm text-slate-950">{strat.strategy_name}</strong>
                  </div>
                  <strong className="text-base text-blue-700">{strat.overall_score}/100</strong>
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Sequence: <span className="text-blue-600">{strat.crop_sequence}</span>
                </div>
                <p className="text-xs text-slate-600">{strat.objective}</p>
                <div className="grid grid-cols-4 gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                  <div>Climate: <strong>{strat.scores.climate}</strong></div>
                  <div>Water: <strong>{strat.scores.water}</strong></div>
                  <div>Soil: <strong>{strat.scores.soil}</strong></div>
                  <div>Priority: <strong>{strat.scores.priority}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Recommended Actionable Next Steps */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            5. Recommended Agronomic Action Steps
          </h2>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Pre-Sowing Soil Preparation:</strong> Loamy soil with pH 7.5 provides ideal root development. Avoid excessive deep plowing to preserve subsoil capillary moisture.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Legume Inoculation:</strong> Inoculate chickpea seeds with certified <em>Mesorhizobium ciceri</em> culture to maximize biological nitrogen fixation (BNF).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Water Shortage Contingency:</strong> If canal turns are curtailed by 20%+, switch spring cereal to Pearl Millet to preserve yield stability under heat stress.</span>
            </li>
          </ul>
        </div>

        {/* 6. Scientific References & Attribution */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
          <div><strong>Scientific Attribution:</strong> NASA POWER (Prediction Of Worldwide Energy Resources) Agroclimatology API, NASA Langley Research Center.</div>
          <div><strong>Agronomic Matrix References:</strong> FAO Irrigation and Drainage Paper 56 (Crop Evapotranspiration), PARC (Pakistan Agricultural Research Council) Crop Management Guidelines.</div>
        </div>

      </div>
    </div>
  );
}
