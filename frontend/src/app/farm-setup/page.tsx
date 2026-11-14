"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapPicker from "@/components/MapPicker";
import { createFarm, getLatestFarm } from "@/lib/api";
import { 
  Sprout, 
  MapPin, 
  Droplets, 
  TestTube, 
  Compass, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const PRESET_LOCATIONS = [
  { name: "Faisalabad", lat: 31.4504, lon: 73.1350, region: "Central Rechna", soil: "Loamy", ph: 7.5, crop: "Wheat" },
  { name: "Multan", lat: 30.1575, lon: 71.5249, region: "Cotton-Wheat Belt", soil: "Sandy-Loam", ph: 8.1, crop: "Cotton" },
  { name: "Lahore", lat: 31.5204, lon: 74.3587, region: "Upper Bari Doab", soil: "Clay-Loam", ph: 7.2, crop: "Rice" },
  { name: "Sahiwal", lat: 30.6682, lon: 73.1114, region: "Dairy-Maize Belt", soil: "Loamy", ph: 7.6, crop: "Maize" },
  { name: "Rahim Yar Khan", lat: 28.4212, lon: 70.2989, region: "Cholistan Edge", soil: "Sandy", ph: 8.4, crop: "Pearl Millet" },
  { name: "Bhakkar", lat: 31.6253, lon: 71.0653, region: "Thal Desert", soil: "Sandy", ph: 8.2, crop: "Chickpea" },
  { name: "Rawalpindi", lat: 33.5973, lon: 73.0479, region: "Pothohar Barani", soil: "Sandy-Loam", ph: 6.9, crop: "Wheat" },
  { name: "Gujranwala", lat: 32.1877, lon: 74.1945, region: "Core Basmati", soil: "Clay-Loam", ph: 7.2, crop: "Rice" },
];

export default function FarmSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState("Faisalabad Farm");
  const [locationName, setLocationName] = useState("Faisalabad");
  const [latitude, setLatitude] = useState(31.4504);
  const [longitude, setLongitude] = useState(73.1350);
  const [area, setArea] = useState(0);
  const [soilType, setSoilType] = useState("Loamy");
  const [soilPh, setSoilPh] = useState(7.5);
  const [irrigationType, setIrrigationType] = useState("Canal / Groundwater");
  const [currentCrop, setCurrentCrop] = useState("Wheat");
  const [priority, setPriority] = useState("Soil Health");

  // Load existing farm if present
  useEffect(() => {
    async function loadFarm() {
      try {
        const farm = await getLatestFarm();
        if (farm) {
          setName(farm.name || "Al-Rehman Green Farm");
          setLocationName(farm.location_name || "Faisalabad, Pakistan");
          setLatitude(farm.latitude || 31.4504);
          setLongitude(farm.longitude || 73.1350);
          setArea(farm.area || 5.0);
          setSoilType(farm.soil_type || "Loamy");
          setSoilPh(farm.soil_ph || 7.5);
          setIrrigationType(farm.irrigation_type || "Canal / Groundwater");
          setCurrentCrop(farm.current_crop || "Wheat");
          setPriority(farm.priority || "Soil Health");
        }
      } catch (err) {
        // Fallback default is already set
      }
    }
    loadFarm();
  }, []);

  const handleCoordinatesChange = async (lat: number, lon: number) => {
    setLatitude(lat);
    setLongitude(lon);

    // Sync nearest soil parameters
    let nearest = PRESET_LOCATIONS[0];
    let minD = 999999;
    for (const p of PRESET_LOCATIONS) {
      const d = Math.hypot(p.lat - lat, p.lon - lon);
      if (d < minD) {
        minD = d;
        nearest = p;
      }
    }
    setLocationName(nearest.name);
    setName(`${nearest.name} Farm`);
    setSoilType(nearest.soil);
    setSoilPh(nearest.ph);
    setCurrentCrop(nearest.crop);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`);
      if (res.ok) {
        const geo = await res.json();
        const micro = geo?.address?.village || geo?.address?.hamlet || geo?.address?.suburb || geo?.address?.town || geo?.address?.city;
        if (micro) {
          setLocationName(micro);
          setName(`${micro} Farm`);
        }
      }
    } catch (e) {}
  };

  const handleApplyPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setLocationName(preset.name);
    setName(`${preset.name} Farm`);
    setLatitude(preset.lat);
    setLongitude(preset.lon);
    setSoilType(preset.soil);
    setSoilPh(preset.ph);
    setCurrentCrop(preset.crop);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createFarm({
        name,
        location_name: locationName,
        latitude,
        longitude,
        area: Number(area),
        soil_type: soilType,
        soil_ph: Number(soilPh),
        irrigation_type: irrigationType,
        current_crop: currentCrop,
        priority,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      alert("Failed to save farm profile. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50/50">
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>Module 1: Farm Setup</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          Register Farm Location & Field Parameters
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Select your field on the interactive map canvas. AgroShift AI links these soil parameters with live NASA POWER atmospheric data.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Map & Geolocation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                Interactive Map Canvas
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Lat: {latitude.toFixed(4)}, Lon: {longitude.toFixed(4)}
              </span>
            </div>

            {/* Map Container */}
            <div className="h-[360px] sm:h-[420px] w-full rounded-xl overflow-hidden border border-slate-200">
              <MapPicker latitude={latitude} longitude={longitude} onChange={handleCoordinatesChange} />
            </div>

            {/* Presets */}
            <div className="mt-4">
              <span className="text-xs text-slate-500 block mb-2 font-semibold">
                ⚡ Quick Demo Presets (1-Click Fill):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_LOCATIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-3 py-2 rounded-lg text-left border transition-all text-xs ${
                      locationName === preset.name
                        ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold truncate">{preset.name.split(",")[0]}</div>
                    <div className="text-[10px] text-slate-500 truncate">{preset.region}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Farm Details & Soil Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              Agronomic & Soil Attributes
            </h2>

            {/* Farm Name & Location */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">Farm Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-800 font-bold block mb-1 flex items-center gap-1">
                    <span>Detected Area</span>
                    <span className="text-amber-500 font-black text-sm">★</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">Farm Size (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={area}
                    onChange={(e) => setArea(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Soil Attributes */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">Soil Texture</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  >
                    <option value="Loamy">Loamy (Ideal / Balanced)</option>
                    <option value="Clay-Loam">Clay-Loam (High Moisture Retention)</option>
                    <option value="Sandy-Loam">Sandy-Loam (Well-Drained)</option>
                    <option value="Clay">Clay (Heavy / Dense)</option>
                    <option value="Sandy">Sandy (High Drainage / Low N)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-semibold flex justify-between mb-1">
                    <span>Soil pH</span>
                    <span className="text-blue-700 font-bold">{soilPh} pH</span>
                  </label>
                  <input
                    type="range"
                    min="5.5"
                    max="9.0"
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5.5 (Acidic)</span>
                    <span>7.0 (Neutral)</span>
                    <span>9.0 (Alkaline)</span>
                  </div>
                </div>
              </div>

              {/* Irrigation & Current Crop */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">Irrigation Access</label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  >
                    <option value="Canal / Groundwater">Canal / Groundwater (Conjunctive)</option>
                    <option value="Groundwater / Tube Well">Tube Well Only</option>
                    <option value="Canal Only">Canal Turns Only</option>
                    <option value="Drip / Micro-irrigation">Drip / Micro-irrigation</option>
                    <option value="Rainfed (Barani)">Rainfed (100% NASA Rain)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">Current Base Crop</label>
                  <select
                    value={currentCrop}
                    onChange={(e) => setCurrentCrop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  >
                    <option value="Wheat">Wheat (Rabi Staple)</option>
                    <option value="Maize">Maize (Summer/Spring Cereal)</option>
                    <option value="Cotton">Cotton (Kharif Cash Crop)</option>
                    <option value="Rice">Rice / Basmati (High Water)</option>
                    <option value="Sorghum">Sorghum (Drought Resilient)</option>
                    <option value="Chickpea">Chickpea (Winter Pulse)</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">Farming Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Soil Health", "Water Conservation", "Yield / Profit"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                        priority === p
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <span>Ingesting NASA POWER Coordinates...</span>
              ) : success ? (
                <span className="flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Farm Profile Saved! Launching NASA Intelligence...
                </span>
              ) : (
                <>
                  <span>Analyze My Farm</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
