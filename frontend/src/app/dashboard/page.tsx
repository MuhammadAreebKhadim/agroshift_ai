"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  getLatestFarm, 
  getNasaDataForFarm 
} from "@/lib/api";
import { Farm, NASADataResponse } from "@/lib/types";
import { 
  Satellite, 
  Thermometer, 
  CloudRain, 
  Sun, 
  Flame, 
  ShieldAlert, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  Info,
  Droplets
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from "recharts";

export default function NasaDashboardPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [nasaData, setNasaData] = useState<NASADataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const f = await getLatestFarm();
        setFarm(f);
        if (f.id) {
          const nData = await getNasaDataForFarm(f.id);
          setNasaData(nData);
        }
      } catch (err: any) {
        setError("Could not load NASA environmental data. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 animate-bounce">
          <Satellite className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Ingesting NASA POWER Earth Observations...</h2>
        <p className="text-sm text-slate-500 mt-1">Retrieving PRECTOTCORR, T2M, and ALLSKY_SFC_SW_DWN time series</p>
      </div>
    );
  }

  const summary = nasaData?.summary;
  const indicators = nasaData?.indicators;
  const chartData = (nasaData?.daily_data || []).filter((_, idx) => idx % 4 === 0); // sample for smooth render

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-slate-50/50">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Satellite className="w-3.5 h-3.5" />
            <span>Module 2: NASA Earth Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            NASA POWER Agroclimatology Observations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Official satellite & meteorological observations for{" "}
            <span className="text-blue-700 font-semibold">{farm?.name}</span> ({farm?.location_name} • Lat: {farm?.latitude.toFixed(4)}, Lon: {farm?.longitude.toFixed(4)})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/rotation-planner"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-105"
          >
            <span>Proceed to Rotation Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Scientific Transparency Banner */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3 text-xs text-slate-700 shadow-sm">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-900">Scientific Attribution Note:</strong> NASA POWER delivers calibrated surface solar insolation and atmospheric meteorological metrics. Soil parameters (pH {farm?.soil_ph}, texture &apos;{farm?.soil_type}&apos;) and canal/groundwater access are field-verified inputs from the farmer.
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Mean Temp */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Mean Temperature</span>
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary?.avg_temperature}°C
          </div>
          <div className="text-[11px] text-slate-500">
            Range: {summary?.min_temperature_recorded}°C to {summary?.max_temperature_recorded}°C
          </div>
        </div>

        {/* Total Rain */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Annual Precipitation</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {summary?.total_precipitation} mm
          </div>
          <div className="text-[11px] text-slate-500">
            Rabi: {summary?.rabi_precipitation} mm • Kharif: {summary?.kharif_precipitation} mm
          </div>
        </div>

        {/* Heat Stress Days */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Heat Stress Days</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {summary?.heat_stress_days} Days
          </div>
          <div className="text-[11px] text-slate-500">
            T_max ≥ 35°C (Critical threshold)
          </div>
        </div>

        {/* Max Dry Spell */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Max Dry Spell</span>
            <Droplets className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary?.longest_dry_spell_days} Days
          </div>
          <div className="text-[11px] text-slate-500">
            Consecutive rainless streak
          </div>
        </div>

        {/* Solar Radiation */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Solar Insolation</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary?.avg_solar_radiation}
          </div>
          <div className="text-[11px] text-slate-500">
            MJ/m²/day (All-sky surface radiation)
          </div>
        </div>
      </div>

      {/* Derived Indicators Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Water Scarcity Status</span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            {indicators?.water_scarcity_level} Scarcity
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Heat Stress Risk</span>
          <span className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {indicators?.heat_stress_risk} Risk
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Thermal Classification</span>
          <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            {indicators?.thermal_suitability}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Photosynthesis Index</span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            High Insolation
          </span>
        </div>
      </div>

      {/* Environmental Insight Box (User Specification) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-emerald-50 border-2 border-blue-300 shadow-sm flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
          💡
        </div>
        <div className="space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
            <span>Environmental Insight</span>
            <span className="text-[10px] bg-blue-200/80 px-2 py-0.2 rounded-full text-blue-900 font-bold">NASA Intelligence Analysis</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 leading-relaxed italic">
            &ldquo;Your selected location experiences substantial seasonal temperature variation (up to {summary?.max_temperature_recorded}°C max). Water availability and the recorded {summary?.longest_dry_spell_days}-day dry spell should be carefully considered when selecting the next crop rotation sequence.&rdquo;
          </p>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Envelope Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              12-Month Temperature Profile (NASA T2M / Max / Min)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Unit: °C</span>
          </div>
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.slice(5)} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "0.5rem", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Area type="monotone" dataKey="max_temperature" stroke="#ef4444" fillOpacity={0} strokeWidth={1.5} name="Max Temp (°C)" />
                <Area type="monotone" dataKey="temperature" stroke="#2563eb" fill="url(#tempGrad)" strokeWidth={2} name="Avg Temp (°C)" />
                <Area type="monotone" dataKey="min_temperature" stroke="#0ea5e9" fillOpacity={0} strokeWidth={1.5} name="Min Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Precipitation Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-600" />
              Precipitation Distribution (NASA PRECTOTCORR)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Unit: mm/day</span>
          </div>
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.slice(5)} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "0.5rem", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="precipitation" fill="#2563eb" radius={[4, 4, 0, 0]} name="Rainfall (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
