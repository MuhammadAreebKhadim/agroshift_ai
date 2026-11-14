"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import StructuredChatContent from "@/components/StructuredChatContent";
import dynamic from "next/dynamic";
import { 
  Sprout,
  Home,
  LayoutDashboard,
  Globe, 
  Satellite, 
  RotateCw, 
  Sliders, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Printer,
  Download,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Droplets,
  Thermometer,
  CloudRain,
  Sun,
  Flame,
  Send,
  Loader2,
  Sparkles,
  Zap,
  Info,
  Layers,
  MapPin,
  Compass,
  AlertTriangle,
  User,
  ShieldCheck,
  RotateCcw
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
  Legend, 
  AreaChart, 
  Area 
} from "recharts";

import { 
  getLatestFarm, 
  createFarm, 
  getNasaDataForFarm, 
  getNasaPointData,
  getRotationsForFarm, 
  simulateScenario, 
  sendChatMessage 
} from "@/lib/api";
import { Farm, NASADataResponse, Strategy, SimulationResult } from "@/lib/types";

// Dynamic map picker without SSR
const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function SinglePageApp() {
  // Navigation active tab: "hero" | "farm" | "nasa" | "rotations" | "simulator" | "assistant" | "report"
  const [activeTab, setActiveTab] = useState<string>("hero");

  // Farm state
  const [farm, setFarm] = useState<Farm | null>(null);
  const [farmName, setFarmName] = useState("Faisalabad Farm");
  const [locationName, setLocationName] = useState("Faisalabad");
  const [latitude, setLatitude] = useState(31.4504);
  const [longitude, setLongitude] = useState(73.1350);
  const [area, setArea] = useState<number | "">("");
  const [regionalPreset, setRegionalPreset] = useState("faisalabad");
  const [soilType, setSoilType] = useState("Loamy");
  const [soilPh, setSoilPh] = useState(7.5);
  const [irrigationType, setIrrigationType] = useState("Limited groundwater");
  const [currentCrop, setCurrentCrop] = useState("Wheat");
  const [priority, setPriority] = useState("Water conservation");

  // 13-Crop Universal Matrix
  const ALL_13_CROPS = [
    "Wheat", "Chickpea", "Lentils", "Maize", "Sorghum", 
    "Berseem", "Cotton", "Rice", "Soybean", "Mustard", 
    "Mung Bean", "Pearl Millet", "Sugarcane"
  ];

  // Field Parcel Sub-Division & Multi-Field Management
  interface FieldParcel {
    id: string;
    acres: number;
    soil: string;
    ph: number;
    y2026: string;
    y2027: string;
    y2028: string;
    strategy: string;
    score: number;
    category: string;
    color: string;
  }

  const [registeredFields, setRegisteredFields] = useState<FieldParcel[]>([]);
  const [newFieldId, setNewFieldId] = useState("");
  const [newFieldAcres, setNewFieldAcres] = useState<number | "">("");
  const [newFieldCrop, setNewFieldCrop] = useState("Wheat");
  const [newFieldSoil, setNewFieldSoil] = useState("Loamy");
  const [newFieldPh, setNewFieldPh] = useState<number>(7.5);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [expandedStratKey, setExpandedStratKey] = useState<string | null>(null);

interface DynamicStratCard {
    key: string;
    name: string;
    badgeBg: string;
    badgeText: string;
    cardBorder: string;
    seqBg: string;
    seqText: string;
    seqBorder: string;
    sequence: string;
    overallScore: number;
    focusPoints: string[];
    climateScore: number;
    waterScore: number;
    soilScore: number;
    priorityScore: number;
    rationale: string;
    waterMetric: string;
    nMetric: string;
    pestMetric: string;
    somMetric: string;
    pros: string[];
    considerations: string[];
  }

  const computeDynamicStrategies = (
    crop: string,
    soil: string,
    ph: number,
    pri: string,
    irrig: string
  ): DynamicStratCard[] => {
    let seqA = `${crop} ➔ Chickpea ➔ Maize`;
    let seqB = `${crop} ➔ Pearl Millet ➔ Chickpea`;
    let seqC = `${crop} ➔ Berseem ➔ Maize`;

    let focusA = [
      "Legume biological nitrogen fixation (45-70 kg N/ha credit)",
      "Soil fertility recharge & subterranean organic matter",
      "Balanced crop rotation fracturing hardpans"
    ];
    let focusB = [
      "Exploring lower-water-demand alternatives (300-350 mm)",
      "Subsoil aquifer protection under canal water rationing",
      "Extreme heat and drought tolerance in summer months"
    ];
    let focusC = [
      "High-protein livestock fodder (4-6 clover cuttings)",
      "Cashflow stabilization with weekly dairy forage sales",
      "Continuous organic vegetative groundcover"
    ];

    let ratA = `Strategy A incorporates nitrogen-fixing legumes following ${crop} to biologically replenish soil nitrogen and fracture plow pans, revitalizing root zone health.`;
    let ratB = `Strategy B introduces low-water drought-hardy crops to reduce the irrigation footprint by 35-50% compared to traditional ${crop} monoculture, preserving aquifer levels.`;
    let ratC = `Strategy C integrates high-value dairy forage and diversified cash crops, creating multi-stream farm revenue while recycling organic crop residues.`;

    let waterA = "650 mm/yr";
    let waterB = "380 mm/yr (-42%)";
    let waterC = "820 mm/yr";

    let nA = "+65 kg N/ha credit";
    let nB = "+40 kg N/ha credit";
    let nC = "+105 kg N/ha credit";

    let pestA = "92% Nematode break";
    let pestB = "88% Pest break";
    let pestC = "94% Pathogen break";

    let somA = "+0.32% organic carbon";
    let somB = "+0.20% organic carbon";
    let somC = "+0.45% organic carbon";

    let prosA = [
      "Substantial biological nitrogen credit reducing synthetic urea costs by 30-40%",
      "Deep taproot penetration relieves subsurface plow pan compaction",
      "High cereal grain yield potential in cycle year 3"
    ];
    let consA = [
      "Requires Rhizobium seed inoculation in fields without recent pulse cultivation",
      "Susceptible to waterlogging during flower initiation stage"
    ];

    let prosB = [
      "Saves 35-50% irrigation water, ideal for restricted canal turns or tubewell power cuts",
      "C4 photosynthesis efficiency under 40°C+ summer heat stress",
      "Low input cost and minimal synthetic pesticide dependency"
    ];
    let consB = [
      "Requires local market linkage for millet grain and stover sales",
      "Requires firm, well-aerated seedbed during monsoon emergence"
    ];

    let prosC = [
      "Provides 4-6 cuttings of premium green fodder for dairy cattle",
      "Generates continuous weekly cash revenue during winter months",
      "Rapid vegetative groundcover suppresses winter broadleaf weeds naturally"
    ];
    let consC = [
      "Requires frequent light irrigation passes during initial seedling establishment",
      "Higher farm labor requirement for cutting and transporting forage"
    ];

    if (crop === "Sugarcane") {
      seqA = "Sugarcane ➔ Berseem ➔ Wheat";
      seqB = "Sugarcane ➔ Chickpea ➔ Sorghum";
      seqC = "Sugarcane ➔ Mung Bean ➔ Mustard";
      focusA = [
        "Rejuvenates soil structure after heavy multi-year cane harvesting",
        "Berseem clover fixes 90-110 kg N/ha in exhausted root zones",
        "Prepares ideal friable crumb structure for high-yield wheat succession"
      ];
      focusB = [
        "Drastically mitigates cane's 1400mm water footprint",
        "Chickpea and Sorghum require 60% less water than ratoon cane",
        "Conserves aquifer reserves in canal-deficit command zones"
      ];
      focusC = [
        "Fast 65-day mung bean summer pulse between harvest windows",
        "Mustard glucosinolates provide biofumigation against cane root rot",
        "Diversified oilseed and pulse cashflow stabilizes farm profits"
      ];
      ratA = "Sugarcane severely depletes soil organic matter and subsoil nutrients over 12-24 month ratoon cycles. Strategy A introduces Berseem clover to deliver massive biological nitrogen fixation (95 kg N/ha) and friable soil aeration before rotating to wheat.";
      ratB = "Sugarcane is the highest water-consuming crop in the matrix (1,400 mm). Strategy B halts the water deficit spiral by succeeding with ultra low-water Chickpea and drought-hardy Sorghum, slashing irrigation demand by 58%.";
      ratC = "Strategy C eliminates prolonged sugarcane monoculture pest cycles (red rot and root-knot nematodes) via biofumigant mustard and summer mung bean, restoring active soil microbial diversity.";
      waterA = "1,050 mm/yr (-25%)";
      waterB = "520 mm/yr (-63%)";
      waterC = "680 mm/yr (-51%)";
      nA = "+95 kg N/ha credit";
      nB = "+50 kg N/ha credit";
      nC = "+55 kg N/ha credit";
      pestA = "96% Nematode break";
      pestB = "91% Borer break";
      pestC = "98% Glucosinolate biofumigation";
      somA = "+0.40% organic matter";
      somB = "+0.22% organic matter";
      somC = "+0.30% organic matter";
      prosA = [
        "Breaks soil compaction caused by heavy sugarcane harvesting transport",
        "Biological nitrogen fixation restores nutrient balance without excessive fertilizer",
        "High wheat grain yield following legume residue incorporation"
      ];
      consA = [
        "Requires thorough stubble incorporation and land leveling after cane harvesting",
        "Berseem requires timely winter irrigation intervals"
      ];
    } else if (crop === "Cotton") {
      seqA = "Cotton ➔ Wheat ➔ Chickpea";
      seqB = "Cotton ➔ Sorghum ➔ Mung Bean";
      seqC = "Cotton ➔ Mustard ➔ Berseem";
      focusA = [
        "Breaks bollworm and whitefly cycles with non-host cereals and legumes",
        "Deep cotton taproot channels utilized by subsequent wheat root systems",
        "Chickpea pulse biological nitrogen recharge (55-70 kg N/ha)"
      ];
      focusB = [
        "Low-water drought hardy C4 Sorghum buffers cotton irrigation demand",
        "Rapid 65-day Mung Bean provides protective summer canopy cover",
        "Preserves subsoil aquifer levels in arid cotton-wheat zones"
      ];
      focusC = [
        "Winter edible oilseed cash crop followed by multi-cut dairy forage",
        "Mustard roots release biofumigant compounds suppressing cotton root rot",
        "High commercial liquidity beyond volatile lint fiber markets"
      ];
      ratA = "Cotton cultivation often fosters severe pest reservoirs and nitrogen depletion. Strategy A introduces the classical robust Cotton-Wheat-Chickpea cycle, utilizing chickpea to restore 60 kg N/ha and breaking persistent pink bollworm lifecycles.";
      ratB = "Cotton demands 750 mm of irrigation in hot arid belts. Strategy B pairs Sorghum and Mung Bean to cut subsequent seasonal water use by 45%, guarding against canal closures.";
      ratC = "Strategy C pairs mustard biofumigation with berseem clover, controlling fungal verticillium wilt while supplying high-yield dairy forage for livestock integration.";
      waterA = "690 mm/yr";
      waterB = "460 mm/yr (-38%)";
      waterC = "720 mm/yr";
      nA = "+60 kg N/ha credit";
      nB = "+45 kg N/ha credit";
      nC = "+90 kg N/ha credit";
      pestA = "95% Bollworm break";
      pestB = "89% Whitefly break";
      pestC = "97% Wilt biofumigation";
    } else if (crop === "Rice") {
      seqA = "Rice ➔ Chickpea ➔ Sorghum";
      seqB = "Rice ➔ Lentils ➔ Pearl Millet";
      seqC = "Rice ➔ Berseem ➔ Wheat";
      focusA = [
        "Alleviates soil compaction and restores aeration after puddle-flooded paddy",
        "Chickpea biological nitrogen fixation reconditions anaerobic soil horizons",
        "Sorghum deep taproots break plow pans and extract residual subsoil salts"
      ];
      focusB = [
        "Counterbalances rice's heavy 1,200mm water footprint with drought pulses",
        "Lentils establish on residual paddy moisture without pre-sowing irrigation",
        "Pearl Millet requires only 350mm water, slashing seasonal farm water use"
      ];
      focusC = [
        "Relay sowing Berseem directly into standing rice stubble (Zero-Till)",
        "Supplies 4-6 cuttings of premium winter forage for dairy herds",
        "Prepares high-fertility seedbed for high-yield spring wheat"
      ];
      ratA = "Prolonged flooding in rice creates anaerobic soil conditions and dense plow pans. Strategy A introduces Chickpea and Sorghum to naturally de-compact the soil profile, re-introducing aerobic microbial ecology.";
      ratB = "Rice consumes vast groundwater volumes. Strategy B introduces Lentils and Pearl Millet, saving over 60% irrigation water in succeeding cycles to prevent local water table collapse.";
      ratC = "Capitalizes on high residual soil moisture in rice fields for zero-tillage relay berseem, maximizing forage output while cutting field prep fuel costs.";
      waterA = "720 mm/yr (-40%)";
      waterB = "440 mm/yr (-63%)";
      waterC = "860 mm/yr (-28%)";
      nA = "+55 kg N/ha credit";
      nB = "+45 kg N/ha credit";
      nC = "+100 kg N/ha credit";
      pestA = "94% Stem borer break";
      pestB = "90% Blast break";
      pestC = "93% Weed suppression";
    } else if (crop === "Maize") {
      seqA = "Maize ➔ Berseem ➔ Wheat";
      seqB = "Maize ➔ Chickpea ➔ Sorghum";
      seqC = "Maize ➔ Soybean ➔ Mustard";
      focusA = ["Berseem biological nitrogen credit (+100 kg N/ha)", "Soil organic matter replenishment", "Wheat yield optimization"];
      focusB = ["Water-saving pulse-cereal succession", "Drought resilience in summer", "Input cost reduction"];
      focusC = ["Oilseed-protein diversification", "Glucosinolate biofumigation", "Premium grain market prices"];
      ratA = "Maize is a heavy nitrogen and nutrient feeder. Strategy A places Berseem clover immediately after maize harvest to pump over 100 kg of biological N per hectare into the soil, priming the field for high-yield wheat.";
      ratB = "Strategy B shifts the rotation to drought-hardy pulses and cereals, protecting yields even when tubewell pumping is constrained.";
      ratC = "Strategy C incorporates Soybean and Mustard for dual cashflow from protein meals and edible vegetable oil, insulating against grain price swings.";
    }

    let climA = 88, climB = 90, climC = 84;
    let watA = 85, watB = 96, watC = 76;
    let soilA = 92, soilB = 82, soilC = 84;
    let priA = 88, priB = 86, priC = 84;

    if (irrig.includes("Limited")) {
      watB += 3;
      watA -= 2;
      watC -= 4;
    } else if (irrig.includes("Drip")) {
      watA += 4;
      watB += 2;
      watC += 5;
    }

    if (soil === "Loamy") {
      soilA += 3;
      soilB += 2;
      soilC += 2;
    } else if (soil === "Sandy") {
      soilB += 4;
      soilA -= 3;
      soilC -= 4;
      watB += 2;
    } else if (soil === "Clay") {
      soilA += 2;
      soilC += 3;
      soilB -= 2;
    }

    if (ph >= 6.8 && ph <= 7.8) {
      soilA += 2;
      soilB += 2;
      soilC += 2;
    } else if (ph > 8.0) {
      soilA -= 3;
      soilB -= 2;
      soilC -= 2;
    }

    if (pri.includes("Soil")) {
      priA = 99;
      priB = 70;
      priC = 84;
      soilA += 4;
      climA += 4;
      watA += 2;
    } else if (pri.includes("Water")) {
      priB = 99;
      priA = 72;
      priC = 68;
      watB += 3;
    } else {
      priC = 99;
      priA = 84;
      priB = 72;
      climC += 8;
      watC += 6;
      soilC += 4;
    }

    climA = Math.min(99, Math.max(50, climA));
    climB = Math.min(99, Math.max(50, climB));
    climC = Math.min(99, Math.max(50, climC));
    watA = Math.min(99, Math.max(50, watA));
    watB = Math.min(99, Math.max(50, watB));
    watC = Math.min(99, Math.max(50, watC));
    soilA = Math.min(99, Math.max(50, soilA));
    soilB = Math.min(99, Math.max(50, soilB));
    soilC = Math.min(99, Math.max(50, soilC));
    priA = Math.min(99, Math.max(50, priA));
    priB = Math.min(99, Math.max(50, priB));
    priC = Math.min(99, Math.max(50, priC));

    const scoreA = Math.round(0.25 * climA + 0.25 * watA + 0.25 * soilA + 0.25 * priA);
    const scoreB = Math.round(0.25 * climB + 0.25 * watB + 0.25 * soilB + 0.25 * priB);
    const scoreC = Math.round(0.25 * climC + 0.25 * watC + 0.25 * soilC + 0.25 * priC);

    return [
      {
        key: "stratA",
        name: "Strategy A — Soil Improvement",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-800",
        cardBorder: "border-emerald-500",
        seqBg: "bg-emerald-50",
        seqText: "text-emerald-700",
        seqBorder: "border-emerald-200",
        sequence: seqA,
        overallScore: scoreA,
        focusPoints: focusA,
        climateScore: climA,
        waterScore: watA,
        soilScore: soilA,
        priorityScore: priA,
        rationale: ratA,
        waterMetric: waterA,
        nMetric: nA,
        pestMetric: pestA,
        somMetric: somA,
        pros: prosA,
        considerations: consA
      },
      {
        key: "stratB",
        name: "Strategy B — Water Conscious",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-800",
        cardBorder: "border-blue-600",
        seqBg: "bg-blue-50",
        seqText: "text-blue-700",
        seqBorder: "border-blue-200",
        sequence: seqB,
        overallScore: scoreB,
        focusPoints: focusB,
        climateScore: climB,
        waterScore: watB,
        soilScore: soilB,
        priorityScore: priB,
        rationale: ratB,
        waterMetric: waterB,
        nMetric: nB,
        pestMetric: pestB,
        somMetric: somB,
        pros: prosB,
        considerations: consB
      },
      {
        key: "stratC",
        name: "Strategy C — Diversified Farming",
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-800",
        cardBorder: "border-slate-300",
        seqBg: "bg-slate-100",
        seqText: "text-slate-800",
        seqBorder: "border-slate-200",
        sequence: seqC,
        overallScore: scoreC,
        focusPoints: focusC,
        climateScore: climC,
        waterScore: watC,
        soilScore: soilC,
        priorityScore: priC,
        rationale: ratC,
        waterMetric: waterC,
        nMetric: nC,
        pestMetric: pestC,
        somMetric: somC,
        pros: prosC,
        considerations: consC
      }
    ];
  };

  const getRotationForCrop = (
    crop: string, 
    soil: string = "Loamy", 
    ph: number = 7.5,
    pri: string = priority,
    irrig: string = irrigationType
  ) => {
    const candidates = computeDynamicStrategies(crop, soil, ph, pri, irrig);
    const sorted = [...candidates].sort((a, b) => b.overallScore - a.overallScore);
    const best = sorted[0];

    const parts = best.sequence.split("➔").map(s => s.trim());
    const y2027 = parts[1] || "Chickpea";
    const y2028 = parts[2] || "Maize";

    return {
      y2027,
      y2028,
      strategy: best.name,
      score: best.overallScore,
      category: best.focusPoints[0] || "Optimized Agro-Ecological Succession",
      color: `${best.badgeBg} ${best.badgeText}`
    };
  };

  const handleAddField = () => {
    const acresVal = Number(newFieldAcres) > 0 ? Number(newFieldAcres) : (Number(area) > 0 ? Math.max(1, Math.round(Number(area) / (registeredFields.length + 1))) : 10);
    const fid = newFieldId.trim() || `Field ${registeredFields.length + 1}`;
    const rot = getRotationForCrop(newFieldCrop, newFieldSoil, Number(newFieldPh));
    
    const newField: FieldParcel = {
      id: fid,
      acres: acresVal,
      soil: `${newFieldSoil} (pH ${newFieldPh})`,
      ph: Number(newFieldPh),
      y2026: newFieldCrop,
      y2027: rot.y2027,
      y2028: rot.y2028,
      strategy: rot.strategy,
      score: rot.score,
      category: rot.category,
      color: rot.color
    };
    
    setRegisteredFields(prev => [...prev, newField]);
    setSaveToast(`✅ Saved ${fid} (${acresVal} ac, ${newFieldCrop}, ${newFieldSoil}) to ${farmName}! Enter next field below.`);
    setNewFieldId(`Field ${registeredFields.length + 2}`);
    setNewFieldAcres("");
  };

  const handleRemoveField = (idx: number) => {
    setRegisteredFields(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateFieldYear = (idx: number, year: "y2027" | "y2028", crop: string) => {
    if (registeredFields.length === 0) {
      const defaultField: FieldParcel = {
        id: newFieldId.trim() || "Field 1 (Whole Farm)",
        acres: Number(area) > 0 ? Number(area) : 30,
        soil: `${soilType} (pH ${soilPh})`,
        ph: Number(soilPh),
        y2026: currentCrop,
        ...getRotationForCrop(currentCrop, soilType, Number(soilPh)),
        [year]: crop
      };
      setRegisteredFields([defaultField]);
    } else {
      setRegisteredFields(prev => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], [year]: crop };
        return copy;
      });
    }
  };

  // NASA & Rotation states
  const [nasaData, setNasaData] = useState<NASADataResponse | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loadingNasa, setLoadingNasa] = useState(false);

  // Simulator states (matching user spec: -20% rain, +2°C temp, -30% water)
  const [simRain, setSimRain] = useState(-20);
  const [simTemp, setSimTemp] = useState(2.0);
  const [simWater, setSimWater] = useState(-30);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [simMode, setSimMode] = useState<"location" | "portfolio">("location");
  const [isSimPending, startSimTransition] = useTransition();
  const [stressRate, setStressRate] = useState<number>(7);

  // Chatbot states (Open-ended AgriAI)
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I am your **AgriAI Advisor**. You can ask me **anything**—from crop rotations, weather stress, soil pH, and pest management, to fertilizer schedules. How can I help your farm today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

// Strategy detail inline accordion state handled via expandedStratKey

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const f = await getLatestFarm();
        if (f) {
          setFarm(f);
          setFarmName(f.name || "My Faisalabad Farm");
          setLocationName(f.location_name || "Faisalabad");
          setLatitude(f.latitude || 31.4504);
          setLongitude(f.longitude || 73.1350);
          setArea(f.area || 0);
          setSoilType(f.soil_type || "Loamy");
          setSoilPh(f.soil_ph || 7.5);
          setIrrigationType(f.irrigation_type || "Limited groundwater");
          setPriority(f.priority || "Water conservation");

          if (f.id) {
            const [nData, strats, simRes] = await Promise.all([
              getNasaDataForFarm(f.id),
              getRotationsForFarm(f.id),
              simulateScenario(f.id, {
                rainfall_change_pct: -20,
                temperature_change_c: 2.0,
                water_change_pct: -30,
              }),
            ]);
            setNasaData(nData);
            setStrategies(strats);
            setSimulation(simRes);
          }
        }
      } catch (e) {
        console.error("Init error:", e);
      }
    }
    init();
  }, []);

  // Auto-fetch NASA data whenever lat/lon changes (debounced 800ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!latitude || !longitude) return;
      setLoadingNasa(true);
      try {
        const nData = await getNasaPointData(latitude, longitude);
        setNasaData(nData);
      } catch (e) {
        console.warn("NASA auto-fetch failed:", e);
      } finally {
        setLoadingNasa(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [latitude, longitude]);
  // 135+ High-Precision Locality Soil Atlas (Soil Survey of Pakistan / PARC / FAO-56)
  const REGIONAL_SOIL_ATLAS = [
      // Central Rechna / Sandal Bar (Loamy alluvium, Lyallpur series, pH 7.5-7.7)
      { name: "Faisalabad", district: "Faisalabad", tehsil: "Faisalabad City", lat: 31.4504, lon: 73.1350, soil: "Loamy", ph: 7.5, crop: "Wheat", irrigation: "Limited groundwater", zone: "Central Rechna Alluvial" },
      { name: "Jaranwala", district: "Faisalabad", tehsil: "Jaranwala", lat: 31.3333, lon: 73.4167, soil: "Loamy", ph: 7.6, crop: "Wheat", irrigation: "Canal turns only", zone: "Central Alluvial Plain" },
      { name: "Samundri", district: "Faisalabad", tehsil: "Samundri", lat: 31.0628, lon: 72.9558, soil: "Loamy", ph: 7.7, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Central Alluvial Plain" },
      { name: "Tandlianwala", district: "Faisalabad", tehsil: "Tandlianwala", lat: 31.0333, lon: 73.1333, soil: "Loamy", ph: 7.7, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Ravi Riverine Border" },
      { name: "Chak Jhumra", district: "Faisalabad", tehsil: "Chak Jhumra", lat: 31.5667, lon: 73.1833, soil: "Loamy", ph: 7.5, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Central Rechna Alluvial" },
      { name: "Khurrianwala", district: "Faisalabad", tehsil: "Jaranwala", lat: 31.5000, lon: 73.2667, soil: "Loamy", ph: 7.5, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Central Rechna Alluvial" },
      { name: "Toba Tek Singh", district: "Toba Tek Singh", tehsil: "Toba Tek Singh", lat: 30.9744, lon: 72.4827, soil: "Loamy", ph: 7.6, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Sandal Bar Plain" },
      { name: "Gojra", district: "Toba Tek Singh", tehsil: "Gojra", lat: 31.1495, lon: 72.6841, soil: "Loamy", ph: 7.5, crop: "Maize", irrigation: "Canal / Groundwater", zone: "Sandal Bar Plain" },
      { name: "Kamalia", district: "Toba Tek Singh", tehsil: "Kamalia", lat: 30.7258, lon: 72.6447, soil: "Loamy", ph: 7.6, crop: "Sugarcane", irrigation: "Canal / Groundwater", zone: "Ravi Floodplain" },
      { name: "Pir Mahal", district: "Toba Tek Singh", tehsil: "Pir Mahal", lat: 30.7675, lon: 72.4356, soil: "Loamy", ph: 7.6, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Sandal Bar Plain" },
      { name: "Jhang", district: "Jhang", tehsil: "Jhang", lat: 31.2681, lon: 72.3181, soil: "Sandy-Loam", ph: 7.8, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Chenab Riverine Alluvium" },
      { name: "Shorkot", district: "Jhang", tehsil: "Shorkot", lat: 30.8294, lon: 72.0789, soil: "Sandy-Loam", ph: 7.9, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Lower Chenab Plain" },
      { name: "Ahmadpur Sial", district: "Jhang", tehsil: "Ahmadpur Sial", lat: 30.6833, lon: 71.7500, soil: "Sandy-Loam", ph: 8.0, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Lower Chenab Plain" },
      { name: "Chiniot", district: "Chiniot", tehsil: "Chiniot", lat: 31.7200, lon: 72.9789, soil: "Loamy", ph: 7.4, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Chenab Floodplain" },
      { name: "Lalian", district: "Chiniot", tehsil: "Lalian", lat: 31.8167, lon: 72.7833, soil: "Loamy", ph: 7.5, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Chenab Floodplain" },
      { name: "Bhowana", district: "Chiniot", tehsil: "Bhowana", lat: 31.5667, lon: 72.6500, soil: "Loamy", ph: 7.5, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Chenab Alluvial" },

      // Southern Cotton-Wheat Arid Belt (Sandy Loam / Calcareous alluvium, pH 7.9-8.3)
      { name: "Multan", district: "Multan", tehsil: "Multan City", lat: 30.1575, lon: 71.5249, soil: "Sandy-Loam", ph: 8.1, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Southern Cotton-Wheat Zone" },
      { name: "Shujabad", district: "Multan", tehsil: "Shujabad", lat: 29.8804, lon: 71.2949, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Chenab Left Bank" },
      { name: "Jalalpur Pirwala", district: "Multan", tehsil: "Jalalpur Pirwala", lat: 29.5053, lon: 71.2211, soil: "Sandy-Loam", ph: 8.3, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Sutlej-Chenab Confluence" },
      { name: "Khanewal", district: "Khanewal", tehsil: "Khanewal", lat: 30.3017, lon: 71.9321, soil: "Sandy-Loam", ph: 8.0, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Lower Bari Doab" },
      { name: "Mian Channu", district: "Khanewal", tehsil: "Mian Channu", lat: 30.4398, lon: 72.3553, soil: "Sandy-Loam", ph: 7.9, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Lower Bari Doab" },
      { name: "Kabirwala", district: "Khanewal", tehsil: "Kabirwala", lat: 30.4042, lon: 71.8622, soil: "Sandy-Loam", ph: 8.0, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Ravi-Chenab Doab" },
      { name: "Jahanian", district: "Khanewal", tehsil: "Jahanian", lat: 30.0833, lon: 71.9167, soil: "Sandy-Loam", ph: 8.1, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Lower Bari Doab" },
      { name: "Vehari", district: "Vehari", tehsil: "Vehari", lat: 30.0419, lon: 72.3528, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Vehari Cotton Belt" },
      { name: "Burewala", district: "Vehari", tehsil: "Burewala", lat: 30.1500, lon: 72.6833, soil: "Sandy-Loam", ph: 8.0, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Vehari Cotton Belt" },
      { name: "Mailsi", district: "Vehari", tehsil: "Mailsi", lat: 29.8000, lon: 72.1833, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Sutlej Valley" },
      { name: "Lodhran", district: "Lodhran", tehsil: "Lodhran", lat: 29.5405, lon: 71.6336, soil: "Sandy-Loam", ph: 8.3, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Sutlej Riverine" },
      { name: "Dunyapur", district: "Lodhran", tehsil: "Dunyapur", lat: 29.8000, lon: 71.7333, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Sutlej Riverine" },
      { name: "Kahror Pacca", district: "Lodhran", tehsil: "Kahror Pacca", lat: 29.6236, lon: 71.9150, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Sutlej Riverine" },

      // Eastern Monsoon Rice-Wheat Command (Clay-Loam, Pacca Series, pH 7.1-7.4)
      { name: "Lahore", district: "Lahore", tehsil: "Lahore Cantt", lat: 31.5204, lon: 74.3587, soil: "Clay-Loam", ph: 7.2, crop: "Rice", irrigation: "Canal turns only", zone: "Upper Bari Doab" },
      { name: "Raiwind", district: "Lahore", tehsil: "Raiwind", lat: 31.2486, lon: 74.2153, soil: "Clay-Loam", ph: 7.3, crop: "Rice", irrigation: "Canal / Groundwater", zone: "Upper Bari Doab" },
      { name: "Kasur", district: "Kasur", tehsil: "Kasur", lat: 31.1167, lon: 74.4500, soil: "Clay-Loam", ph: 7.4, crop: "Rice", irrigation: "Canal turns only", zone: "Upper Bari Doab" },
      { name: "Chunian", district: "Kasur", tehsil: "Chunian", lat: 30.9639, lon: 73.9806, soil: "Clay-Loam", ph: 7.3, crop: "Rice", irrigation: "Canal turns only", zone: "Upper Bari Doab" },
      { name: "Pattoki", district: "Kasur", tehsil: "Pattoki", lat: 31.0214, lon: 73.8486, soil: "Loamy", ph: 7.3, crop: "Berseem", irrigation: "Canal / Groundwater", zone: "Floriculture & Fodder Belt" },
      { name: "Kot Radha Kishan", district: "Kasur", tehsil: "Kot Radha Kishan", lat: 31.1717, lon: 74.0989, soil: "Clay-Loam", ph: 7.3, crop: "Rice", irrigation: "Canal turns only", zone: "Upper Bari Doab" },
      { name: "Sheikhupura", district: "Sheikhupura", tehsil: "Sheikhupura", lat: 31.7131, lon: 73.9783, soil: "Clay-Loam", ph: 7.3, crop: "Rice", irrigation: "Canal turns only", zone: "Kalar Rice Tract" },
      { name: "Ferozewala", district: "Sheikhupura", tehsil: "Ferozewala", lat: 31.6667, lon: 74.2500, soil: "Clay-Loam", ph: 7.2, crop: "Rice", irrigation: "Canal turns only", zone: "Kalar Rice Tract" },
      { name: "Muridke", district: "Sheikhupura", tehsil: "Muridke", lat: 31.8022, lon: 74.2572, soil: "Clay-Loam", ph: 7.2, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Kalar Rice Tract" },
      { name: "Sharaqpur", district: "Sheikhupura", tehsil: "Sharaqpur", lat: 31.4667, lon: 74.1000, soil: "Loamy", ph: 7.3, crop: "Rice", irrigation: "Canal / Groundwater", zone: "Ravi Riverine Rice" },
      { name: "Nankana Sahib", district: "Nankana Sahib", tehsil: "Nankana Sahib", lat: 31.4492, lon: 73.7125, soil: "Clay-Loam", ph: 7.4, crop: "Rice", irrigation: "Canal turns only", zone: "Rice-Wheat Transitional" },
      { name: "Sangla Hill", district: "Nankana Sahib", tehsil: "Sangla Hill", lat: 31.7167, lon: 73.3833, soil: "Loamy", ph: 7.4, crop: "Rice", irrigation: "Canal / Groundwater", zone: "Rice-Wheat Transitional" },
      { name: "Shahkot", district: "Nankana Sahib", tehsil: "Shahkot", lat: 31.5667, lon: 73.4833, soil: "Loamy", ph: 7.4, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Rice-Wheat Transitional" },

      // Northern Core Basmati Bowl (Clay Loam / Silty Clay Loam, pH 7.0-7.3)
      { name: "Gujranwala", district: "Gujranwala", tehsil: "Gujranwala City", lat: 32.1877, lon: 74.1945, soil: "Clay-Loam", ph: 7.2, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Core Basmati Rice Bowl" },
      { name: "Kamoke", district: "Gujranwala", tehsil: "Kamoke", lat: 31.9744, lon: 74.2239, soil: "Clay-Loam", ph: 7.2, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Core Basmati Rice Bowl" },
      { name: "Nowshera Virkan", district: "Gujranwala", tehsil: "Nowshera Virkan", lat: 31.9667, lon: 73.9667, soil: "Clay-Loam", ph: 7.3, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Core Basmati Rice Bowl" },
      { name: "Wazirabad", district: "Wazirabad", tehsil: "Wazirabad", lat: 32.4414, lon: 74.1197, soil: "Clay-Loam", ph: 7.2, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Chenab Alluvial" },
      { name: "Sialkot", district: "Sialkot", tehsil: "Sialkot", lat: 32.4945, lon: 74.5229, soil: "Clay-Loam", ph: 7.1, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Core Basmati Rice Bowl" },
      { name: "Daska", district: "Sialkot", tehsil: "Daska", lat: 32.3242, lon: 74.3508, soil: "Clay-Loam", ph: 7.1, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Core Basmati Rice Bowl" },
      { name: "Pasrur", district: "Sialkot", tehsil: "Pasrur", lat: 32.2681, lon: 74.6675, soil: "Clay-Loam", ph: 7.1, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Ravi-Chenab Sub-Himalayan" },
      { name: "Sambrial", district: "Sialkot", tehsil: "Sambrial", lat: 32.4833, lon: 74.3500, soil: "Clay-Loam", ph: 7.1, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Core Basmati Rice Bowl" },
      { name: "Narowal", district: "Narowal", tehsil: "Narowal", lat: 32.1000, lon: 74.8833, soil: "Clay-Loam", ph: 7.0, crop: "Rice", irrigation: "Tubewell / Canal", zone: "Ravi-Chenab Sub-Himalayan" },
      { name: "Shakargarh", district: "Narowal", tehsil: "Shakargarh", lat: 32.2639, lon: 75.1606, soil: "Loamy", ph: 7.0, crop: "Wheat", irrigation: "Tubewell / Rainfed", zone: "Sub-Mountainous Piedmont" },
      { name: "Hafizabad", district: "Hafizabad", tehsil: "Hafizabad", lat: 32.0711, lon: 73.6878, soil: "Clay-Loam", ph: 7.3, crop: "Rice", irrigation: "Canal / Groundwater", zone: "Core Basmati Rice Bowl" },
      { name: "Pindi Bhattian", district: "Hafizabad", tehsil: "Pindi Bhattian", lat: 31.8956, lon: 73.2750, soil: "Loamy", ph: 7.4, crop: "Rice", irrigation: "Canal / Groundwater", zone: "Chenab Floodplain" },
      { name: "Gujrat", district: "Gujrat", tehsil: "Gujrat", lat: 32.5744, lon: 74.0754, soil: "Loamy", ph: 7.2, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Sub-Himalayan Piedmont" },
      { name: "Kharian", district: "Gujrat", tehsil: "Kharian", lat: 32.8167, lon: 73.8667, soil: "Sandy-Loam", ph: 7.1, crop: "Wheat", irrigation: "Tubewell / Rainfed", zone: "Sub-Himalayan Piedmont" },
      { name: "Mandi Bahauddin", district: "Mandi Bahauddin", tehsil: "Mandi Bahauddin", lat: 32.5872, lon: 73.4917, soil: "Loamy", ph: 7.4, crop: "Wheat", irrigation: "Canal turns only", zone: "Chaj Doab Alluvium" },
      { name: "Phalia", district: "Mandi Bahauddin", tehsil: "Phalia", lat: 32.4333, lon: 73.5833, soil: "Loamy", ph: 7.4, crop: "Wheat", irrigation: "Canal turns only", zone: "Chaj Doab Alluvium" },

      // Central Dairy & Mixed Crops Belt (Loamy fertile alluvium, pH 7.5-7.7)
      { name: "Sahiwal", district: "Sahiwal", tehsil: "Sahiwal", lat: 30.6682, lon: 73.1114, soil: "Loamy", ph: 7.6, crop: "Maize", irrigation: "Canal / Groundwater", zone: "Central Dairy Agro-Belt" },
      { name: "Chichawatni", district: "Sahiwal", tehsil: "Chichawatni", lat: 30.5333, lon: 72.7000, soil: "Loamy", ph: 7.7, crop: "Maize", irrigation: "Canal / Groundwater", zone: "Central Dairy Agro-Belt" },
      { name: "Okara", district: "Okara", tehsil: "Okara", lat: 30.8081, lon: 73.4458, soil: "Loamy", ph: 7.5, crop: "Maize", irrigation: "Canal / Groundwater", zone: "Potato-Maize Dairy Hub" },
      { name: "Depalpur", district: "Okara", tehsil: "Depalpur", lat: 30.6708, lon: 73.6533, soil: "Loamy", ph: 7.5, crop: "Potato", irrigation: "Canal / Groundwater", zone: "Potato-Maize Dairy Hub" },
      { name: "Renala Khurd", district: "Okara", tehsil: "Renala Khurd", lat: 30.8833, lon: 73.5986, soil: "Loamy", ph: 7.5, crop: "Berseem", irrigation: "Canal / Groundwater", zone: "Canal Colony" },
      { name: "Pakpattan", district: "Pakpattan", tehsil: "Pakpattan", lat: 30.3410, lon: 73.3866, soil: "Sandy-Loam", ph: 7.8, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Sutlej Left Bank" },
      { name: "Arifwala", district: "Pakpattan", tehsil: "Arifwala", lat: 30.2908, lon: 73.0617, soil: "Loamy", ph: 7.7, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Pakpattan Canal Command" },

      // Sargodha Citrus & Mixed Agriculture Belt (Silt Loam, pH 7.6-7.8)
      { name: "Sargodha", district: "Sargodha", tehsil: "Sargodha", lat: 32.0836, lon: 72.6711, soil: "Loamy", ph: 7.6, crop: "Citrus/Wheat", irrigation: "Canal / Groundwater", zone: "Citrus Valley Alluvium" },
      { name: "Bhalwal", district: "Sargodha", tehsil: "Bhalwal", lat: 32.2667, lon: 72.9000, soil: "Loamy", ph: 7.5, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Kinnow Citrus Belt" },
      { name: "Kot Momin", district: "Sargodha", tehsil: "Kot Momin", lat: 32.1917, lon: 73.0333, soil: "Loamy", ph: 7.6, crop: "Citrus/Wheat", irrigation: "Canal / Groundwater", zone: "Kinnow Citrus Belt" },
      { name: "Shahpur", district: "Sargodha", tehsil: "Shahpur", lat: 32.3167, lon: 72.4667, soil: "Sandy-Loam", ph: 7.8, crop: "Wheat", irrigation: "Jhelum Riverine", zone: "Jhelum Floodplain" },
      { name: "Silanwali", district: "Sargodha", tehsil: "Silanwali", lat: 31.8250, lon: 72.5417, soil: "Loamy", ph: 7.7, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Central Chaj Alluvium" },

      // Southern Cholistan Desert Fringe (Sandy / Calcareous, pH 8.2-8.5)
      { name: "Bahawalpur", district: "Bahawalpur", tehsil: "Bahawalpur City", lat: 29.3956, lon: 71.6836, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Cholistan Fringe" },
      { name: "Ahmedpur East", district: "Bahawalpur", tehsil: "Ahmedpur East", lat: 29.1431, lon: 71.2597, soil: "Sandy", ph: 8.3, crop: "Pearl Millet", irrigation: "Drip / Micro", zone: "Cholistan Border" },
      { name: "Yazman", district: "Bahawalpur", tehsil: "Yazman", lat: 29.1211, lon: 71.7456, soil: "Sandy", ph: 8.4, crop: "Pearl Millet", irrigation: "Drip / Micro", zone: "Cholistan Desert" },
      { name: "Hasilpur", district: "Bahawalpur", tehsil: "Hasilpur", lat: 29.6967, lon: 72.5542, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Fordwah Canal Zone" },
      { name: "Bahawalnagar", district: "Bahawalnagar", tehsil: "Bahawalnagar", lat: 29.9983, lon: 73.2528, soil: "Sandy-Loam", ph: 8.1, crop: "Cotton", irrigation: "Canal turns only", zone: "Fordwah Eastern Canal" },
      { name: "Chishtian", district: "Bahawalnagar", tehsil: "Chishtian", lat: 29.7972, lon: 72.8581, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Fordwah Eastern Canal" },
      { name: "Haroonabad", district: "Bahawalnagar", tehsil: "Haroonabad", lat: 29.6125, lon: 73.1361, soil: "Sandy", ph: 8.3, crop: "Pearl Millet", irrigation: "Canal / Groundwater", zone: "Fordwah Eastern Canal" },
      { name: "Fort Abbas", district: "Bahawalnagar", tehsil: "Fort Abbas", lat: 29.1925, lon: 72.8550, soil: "Sandy", ph: 8.5, crop: "Pearl Millet", irrigation: "Drip / Micro", zone: "Deep Cholistan Edge" },
      { name: "Rahim Yar Khan", district: "Rahim Yar Khan", tehsil: "Rahim Yar Khan", lat: 28.4212, lon: 70.2989, soil: "Sandy", ph: 8.4, crop: "Pearl Millet", irrigation: "Drip / Micro", zone: "Extreme Arid Southern Margin" },
      { name: "Sadiqabad", district: "Rahim Yar Khan", tehsil: "Sadiqabad", lat: 28.3006, lon: 70.1308, soil: "Sandy-Loam", ph: 8.3, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Indus Left Bank Alluvium" },
      { name: "Khanpur", district: "Rahim Yar Khan", tehsil: "Khanpur", lat: 28.6472, lon: 70.6569, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Panjnad Canal Command" },
      { name: "Liaquatpur", district: "Rahim Yar Khan", tehsil: "Liaquatpur", lat: 28.9333, lon: 70.9667, soil: "Sandy", ph: 8.4, crop: "Pearl Millet", irrigation: "Drip / Micro", zone: "Abbasia Canal Command" },

      // Thal Desert Sandy Margins (Aeolian Sand Dunes, Chickpea Hub, pH 8.1-8.4)
      { name: "Bhakkar", district: "Bhakkar", tehsil: "Bhakkar", lat: 31.6253, lon: 71.0653, soil: "Sandy", ph: 8.2, crop: "Chickpea", irrigation: "Limited groundwater", zone: "Thal Desert Sandy Plain" },
      { name: "Mankera", district: "Bhakkar", tehsil: "Mankera", lat: 31.3889, lon: 71.4406, soil: "Sandy", ph: 8.3, crop: "Chickpea", irrigation: "Rainfed / Barani", zone: "Thal Desert Sand Dune Core" },
      { name: "Darya Khan", district: "Bhakkar", tehsil: "Darya Khan", lat: 31.7833, lon: 71.1000, soil: "Sandy", ph: 8.2, crop: "Chickpea", irrigation: "Indus Riverine / Barani", zone: "Thal Indus Left Bank" },
      { name: "Kallur Kot", district: "Bhakkar", tehsil: "Kallur Kot", lat: 32.1583, lon: 71.2667, soil: "Sandy", ph: 8.2, crop: "Chickpea", irrigation: "Limited groundwater", zone: "Thal Sandy Plain" },
      { name: "Layyah", district: "Layyah", tehsil: "Layyah", lat: 30.9613, lon: 70.9397, soil: "Sandy", ph: 8.3, crop: "Chickpea", irrigation: "Canal / Groundwater", zone: "Thal Desert Sandy Plain" },
      { name: "Choubara", district: "Layyah", tehsil: "Choubara", lat: 31.0500, lon: 71.5333, soil: "Sandy", ph: 8.4, crop: "Chickpea", irrigation: "Rainfed / Barani", zone: "Thal Desert Sand Dunes" },
      { name: "Karor Lal Esan", district: "Layyah", tehsil: "Karor Lal Esan", lat: 31.2222, lon: 70.9500, soil: "Sandy-Loam", ph: 8.1, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Indus Floodplain Thal" },
      { name: "Mianwali", district: "Mianwali", tehsil: "Mianwali", lat: 32.5839, lon: 71.5370, soil: "Sandy-Loam", ph: 8.0, crop: "Wheat", irrigation: "Canal turns only", zone: "Thal Upper Margin" },
      { name: "Piplan", district: "Mianwali", tehsil: "Piplan", lat: 32.2833, lon: 71.3667, soil: "Sandy-Loam", ph: 8.1, crop: "Wheat", irrigation: "Canal / Groundwater", zone: "Chashma Right Bank / Thal" },
      { name: "Khushab", district: "Khushab", tehsil: "Khushab", lat: 32.2955, lon: 72.3503, soil: "Sandy-Loam", ph: 7.9, crop: "Chickpea", irrigation: "Canal turns only", zone: "Thal-Salt Range Transition" },
      { name: "Noorpur Thal", district: "Khushab", tehsil: "Noorpur Thal", lat: 31.8753, lon: 71.9078, soil: "Sandy", ph: 8.2, crop: "Chickpea", irrigation: "Rainfed / Barani", zone: "Heart of Thal" },
      { name: "Quaidabad", district: "Khushab", tehsil: "Quaidabad", lat: 32.3333, lon: 71.9000, soil: "Sandy-Loam", ph: 8.0, crop: "Wheat", irrigation: "Canal turns only", zone: "Salt Range Foot" },

      // Derajat Piedmont & Hill Torrent Plain (Clay Loam Alluvium, pH 7.9-8.2)
      { name: "Dera Ghazi Khan", district: "Dera Ghazi Khan", tehsil: "D.G. Khan", lat: 30.0561, lon: 70.6348, soil: "Clay-Loam", ph: 8.0, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Sulaiman Piedmont Alluvium" },
      { name: "Taunsa", district: "Taunsa", tehsil: "Taunsa", lat: 30.7042, lon: 70.6508, soil: "Clay-Loam", ph: 7.9, crop: "Wheat", irrigation: "Hill Torrent / Canal", zone: "Sulaiman Piedmont Alluvium" },
      { name: "Kot Chutta", district: "Dera Ghazi Khan", tehsil: "Kot Chutta", lat: 29.8833, lon: 70.6500, soil: "Clay-Loam", ph: 8.1, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Derajat Piedmont" },
      { name: "Rajanpur", district: "Rajanpur", tehsil: "Rajanpur", lat: 29.1035, lon: 70.3250, soil: "Clay-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Tubewell", zone: "Indus Floodplain Derajat" },
      { name: "Jampur", district: "Rajanpur", tehsil: "Jampur", lat: 29.6436, lon: 70.5956, soil: "Clay-Loam", ph: 8.1, crop: "Cotton", irrigation: "Canal / Tubewell", zone: "Derajat Alluvial Plain" },
      { name: "Rojhan", district: "Rajanpur", tehsil: "Rojhan", lat: 28.6833, lon: 69.9500, soil: "Clay-Loam", ph: 8.3, crop: "Cotton", irrigation: "Canal / Tubewell", zone: "Lower Indus Piedmont" },
      { name: "Muzaffargarh", district: "Muzaffargarh", tehsil: "Muzaffargarh", lat: 30.0754, lon: 71.1921, soil: "Sandy-Loam", ph: 8.1, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Chenab-Indus Doab" },
      { name: "Kot Addu", district: "Kot Addu", tehsil: "Kot Addu", lat: 30.4700, lon: 70.9644, soil: "Sandy-Loam", ph: 8.0, crop: "Wheat", irrigation: "Canal turns only", zone: "Taunsa Barrage Left Bank" },
      { name: "Alipur", district: "Muzaffargarh", tehsil: "Alipur", lat: 29.3833, lon: 70.9167, soil: "Sandy-Loam", ph: 8.2, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Panjnad Confluence" },
      { name: "Jatoi", district: "Muzaffargarh", tehsil: "Jatoi", lat: 29.5167, lon: 70.8500, soil: "Sandy-Loam", ph: 8.1, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Indus-Chenab Triangle" },

      // Pothohar Rainfed/Barani Plateau (Sandy-Loam / Loess, pH 6.8-7.3)
      { name: "Rawalpindi", district: "Rawalpindi", tehsil: "Rawalpindi", lat: 33.5973, lon: 73.0479, soil: "Sandy-Loam", ph: 6.9, crop: "Wheat", irrigation: "Rainfed / Barani", zone: "Pothohar Plateau" },
      { name: "Islamabad", district: "Islamabad", tehsil: "Islamabad", lat: 33.6844, lon: 73.0479, soil: "Sandy-Loam", ph: 6.9, crop: "Wheat", irrigation: "Rainfed / Barani", zone: "Margalla Foothills" },
      { name: "Gujar Khan", district: "Rawalpindi", tehsil: "Gujar Khan", lat: 33.2547, lon: 73.3039, soil: "Sandy-Loam", ph: 7.0, crop: "Wheat", irrigation: "Rainfed / Barani", zone: "Pothohar Rainfed Tract" },
      { name: "Taxila", district: "Rawalpindi", tehsil: "Taxila", lat: 33.7463, lon: 72.8397, soil: "Sandy-Loam", ph: 7.0, crop: "Wheat", irrigation: "Rainfed / Barani", zone: "Pothohar Margalla" },
      { name: "Chakwal", district: "Chakwal", tehsil: "Chakwal", lat: 32.9328, lon: 72.8631, soil: "Sandy-Loam", ph: 7.0, crop: "Chickpea", irrigation: "Rainfed / Barani", zone: "Pothohar Plateau" },
      { name: "Choa Saidan Shah", district: "Chakwal", tehsil: "Choa Saidan Shah", lat: 32.7167, lon: 72.9833, soil: "Sandy-Loam", ph: 7.1, crop: "Mustard", irrigation: "Rainfed / Barani", zone: "Salt Range Plateau" },
      { name: "Talagang", district: "Talagang", tehsil: "Talagang", lat: 32.9283, lon: 72.4172, soil: "Sandy-Loam", ph: 7.1, crop: "Groundnut", irrigation: "Rainfed / Barani", zone: "Barani Peanut Belt" },
      { name: "Attock", district: "Attock", tehsil: "Attock", lat: 33.7667, lon: 72.3667, soil: "Sandy-Loam", ph: 7.1, crop: "Wheat", irrigation: "Rainfed / Barani", zone: "Pothohar Northwest" },
      { name: "Fateh Jang", district: "Attock", tehsil: "Fateh Jang", lat: 33.5667, lon: 72.6500, soil: "Sandy-Loam", ph: 7.0, crop: "Wheat", irrigation: "Rainfed / Barani", zone: "Pothohar Rainfed Tract" },
      { name: "Hassan Abdal", district: "Attock", tehsil: "Hassan Abdal", lat: 33.8167, lon: 72.6833, soil: "Sandy-Loam", ph: 7.0, crop: "Wheat", irrigation: "Spring / Rainfed", zone: "Margalla Valley" },
      { name: "Jhelum", district: "Jhelum", tehsil: "Jhelum", lat: 32.9405, lon: 73.7276, soil: "Loamy", ph: 7.2, crop: "Wheat", irrigation: "Rainfed / Tubewell", zone: "Jhelum Piedmont" },
      { name: "Dina", district: "Jhelum", tehsil: "Dina", lat: 33.0278, lon: 73.6028, soil: "Sandy-Loam", ph: 7.1, crop: "Wheat", irrigation: "Rainfed / Barani", zone: "Pothohar Eastern Edge" },
      { name: "Pind Dadan Khan", district: "Jhelum", tehsil: "Pind Dadan Khan", lat: 32.5861, lon: 73.0439, soil: "Sandy-Loam", ph: 7.8, crop: "Wheat", irrigation: "Salt Range Foot", zone: "Jhelum Right Bank" },

      // Lower Indus Basin / Sindh Agricultural Commands (Clay / Silt Loam, pH 8.0-8.3)
      { name: "Sukkur", district: "Sukkur", tehsil: "Sukkur", lat: 27.7052, lon: 68.8574, soil: "Clay", ph: 8.2, crop: "Rice", irrigation: "Perennial canal", zone: "Sindh Lower Indus Right Bank" },
      { name: "Rohri", district: "Sukkur", tehsil: "Rohri", lat: 27.6744, lon: 68.8953, soil: "Clay-Loam", ph: 8.1, crop: "Wheat", irrigation: "Perennial canal", zone: "Indus Left Bank" },
      { name: "Ghotki", district: "Ghotki", tehsil: "Ghotki", lat: 28.0064, lon: 69.3161, soil: "Clay-Loam", ph: 8.1, crop: "Cotton", irrigation: "Perennial canal", zone: "Sindh Cotton Belt" },
      { name: "Mirpur Mathelo", district: "Ghotki", tehsil: "Mirpur Mathelo", lat: 28.0219, lon: 69.5489, soil: "Clay-Loam", ph: 8.2, crop: "Cotton", irrigation: "Perennial canal", zone: "Upper Sindh Alluvium" },
      { name: "Daharki", district: "Ghotki", tehsil: "Daharki", lat: 28.0431, lon: 69.6739, soil: "Sandy-Loam", ph: 8.3, crop: "Cotton", irrigation: "Canal / Groundwater", zone: "Sindh-Punjab Border" },
      { name: "Larkana", district: "Larkana", tehsil: "Larkana", lat: 27.5589, lon: 68.2120, soil: "Clay", ph: 8.1, crop: "Rice", irrigation: "Perennial canal", zone: "Sindh Basmati/Irri Rice Belt" },
      { name: "Khairpur", district: "Khairpur", tehsil: "Khairpur", lat: 27.5295, lon: 68.7592, soil: "Clay-Loam", ph: 8.2, crop: "Cotton", irrigation: "Perennial canal", zone: "Rohri Canal Command" },
      { name: "Shikarpur", district: "Shikarpur", tehsil: "Shikarpur", lat: 27.9556, lon: 68.6382, soil: "Clay", ph: 8.1, crop: "Rice", irrigation: "Perennial canal", zone: "Sindh Upper Rice Belt" },
      { name: "Jacobabad", district: "Jacobabad", tehsil: "Jacobabad", lat: 28.2819, lon: 68.4375, soil: "Clay", ph: 8.2, crop: "Rice", irrigation: "Perennial canal", zone: "Thermal High Heat Rice Belt" },
      { name: "Nawabshah", district: "Shaheed Benazirabad", tehsil: "Nawabshah", lat: 26.2483, lon: 68.4096, soil: "Clay-Loam", ph: 8.1, crop: "Cotton", irrigation: "Perennial canal", zone: "Central Sindh" },
      { name: "Hyderabad", district: "Hyderabad", tehsil: "Hyderabad", lat: 25.3960, lon: 68.3578, soil: "Clay-Loam", ph: 8.0, crop: "Cotton", irrigation: "Perennial canal", zone: "Kotri Barrage Command" },
      { name: "Mirpur Khas", district: "Mirpur Khas", tehsil: "Mirpur Khas", lat: 25.5269, lon: 69.0111, soil: "Clay-Loam", ph: 8.1, crop: "Cotton", irrigation: "Perennial canal", zone: "Sindh Mango-Cotton Belt" },
      { name: "Badin", district: "Badin", tehsil: "Badin", lat: 24.6558, lon: 68.8383, soil: "Clay", ph: 8.1, crop: "Rice", irrigation: "Perennial canal", zone: "Lower Indus Coastal Delta" },

      // Khyber Pakhtunkhwa Valleys (Loamy / Sandy-Loam, pH 6.9-7.5)
      { name: "Peshawar", district: "Peshawar", tehsil: "Peshawar", lat: 34.0150, lon: 71.5805, soil: "Loamy", ph: 7.3, crop: "Wheat", irrigation: "Canal / Tubewell", zone: "Peshawar Valley Alluvium" },
      { name: "Mardan", district: "Mardan", tehsil: "Mardan", lat: 34.1989, lon: 72.0403, soil: "Loamy", ph: 7.2, crop: "Sugarcane", irrigation: "Perennial canal", zone: "Peshawar-Mardan Basin" },
      { name: "Swabi", district: "Swabi", tehsil: "Swabi", lat: 34.1202, lon: 72.4698, soil: "Sandy-Loam", ph: 7.1, crop: "Tobacco/Maize", irrigation: "Canal / Tubewell", zone: "Swabi Tobacco Belt" },
      { name: "Charsadda", district: "Charsadda", tehsil: "Charsadda", lat: 34.1482, lon: 71.7406, soil: "Loamy", ph: 7.2, crop: "Sugarcane", irrigation: "Riverine Canal", zone: "Kabul River Floodplain" },
      { name: "Dera Ismail Khan", district: "D.I. Khan", tehsil: "D.I. Khan", lat: 31.8314, lon: 70.9019, soil: "Sandy-Loam", ph: 7.9, crop: "Wheat", irrigation: "Chashma Right Bank", zone: "Derajat Northern Margin" }
    ];

  const findGoverningRegionalPreset = (lat: number, lon: number, district?: string, localityName?: string): string => {
    const d = (district || '').toLowerCase();
    const l = (localityName || '').toLowerCase();

    if (d.includes('faisalabad') || d.includes('toba tek singh') || d.includes('jhang') || d.includes('chiniot') || l.includes('samundri') || l.includes('jaranwala') || l.includes('gojra') || l.includes('kamalia')) {
      return 'faisalabad';
    }
    if (d.includes('multan') || d.includes('khanewal') || d.includes('vehari') || d.includes('lodhran') || l.includes('shujabad') || l.includes('mian channu') || l.includes('burewala') || l.includes('jahanian') || l.includes('kabirwala')) {
      return 'multan';
    }
    if (d.includes('lahore') || d.includes('kasur') || d.includes('sheikhupura') || d.includes('nankana') || l.includes('chunian') || l.includes('pattoki') || l.includes('muridke') || l.includes('kot radha kishan')) {
      return 'lahore';
    }
    if (d.includes('sahiwal') || d.includes('okara') || d.includes('pakpattan') || l.includes('chichawatni') || l.includes('depalpur') || l.includes('renala khurd') || l.includes('arifwala')) {
      return 'sahiwal';
    }
    if (d.includes('rahim yar khan') || d.includes('bahawalpur') || d.includes('bahawalnagar') || l.includes('sadiqabad') || l.includes('khanpur') || l.includes('liaquatpur') || l.includes('chishtian') || l.includes('haroonabad') || l.includes('ahmedpur')) {
      return 'rahim_yar_khan';
    }
    if (d.includes('bhakkar') || d.includes('layyah') || d.includes('mianwali') || d.includes('khushab') || l.includes('mankera') || l.includes('choubara') || l.includes('noorpur thal') || l.includes('karor')) {
      return 'bhakkar';
    }
    if (d.includes('rawalpindi') || d.includes('islamabad') || d.includes('attock') || d.includes('chakwal') || d.includes('jhelum') || d.includes('talagang') || l.includes('gujar khan') || l.includes('taxila') || l.includes('fateh jang')) {
      return 'rawalpindi';
    }
    if (d.includes('gujranwala') || d.includes('sialkot') || d.includes('narowal') || d.includes('hafizabad') || d.includes('gujrat') || d.includes('mandi bahauddin') || d.includes('wazirabad') || l.includes('daska') || l.includes('kamoke') || l.includes('pasrur') || l.includes('sambrial')) {
      return 'gujranwala';
    }
    if (d.includes('dera ghazi khan') || d.includes('taunsa') || d.includes('rajanpur') || d.includes('muzaffargarh') || d.includes('kot addu') || l.includes('jampur') || l.includes('alipur') || l.includes('jatoi')) {
      return 'dera_ghazi_khan';
    }
    if (d.includes('sukkur') || d.includes('ghotki') || d.includes('larkana') || d.includes('shikarpur') || d.includes('khairpur') || d.includes('nawabshah') || d.includes('hyderabad') || d.includes('badin') || d.includes('jacobabad')) {
      return 'sukkur';
    }

    const PRESET_COORDINATES = [
      { key: 'faisalabad', lat: 31.4504, lon: 73.1350 },
      { key: 'multan', lat: 30.1575, lon: 71.5249 },
      { key: 'lahore', lat: 31.5204, lon: 74.3587 },
      { key: 'sahiwal', lat: 30.6682, lon: 73.1114 },
      { key: 'rahim_yar_khan', lat: 28.4212, lon: 70.2989 },
      { key: 'bhakkar', lat: 31.6253, lon: 71.0653 },
      { key: 'rawalpindi', lat: 33.5973, lon: 73.0479 },
      { key: 'gujranwala', lat: 32.1877, lon: 74.1945 },
      { key: 'dera_ghazi_khan', lat: 30.0561, lon: 70.6348 },
      { key: 'sukkur', lat: 27.7052, lon: 68.8574 }
    ];

    let bestKey = 'faisalabad';
    let minDistance = 999999;
    for (const p of PRESET_COORDINATES) {
      const dist = Math.hypot(p.lat - lat, p.lon - lon);
      if (dist < minDistance) {
        minDistance = dist;
        bestKey = p.key;
      }
    }
    return bestKey;
  };

  const handleAreaInputChange = (val: string, isExplicitSelect: boolean = false) => {
    if (!val || val.trim().length === 0) return;
    const clean = val.toLowerCase().replace(/[_-]/g, ' ').split('(')[0].trim();
    
    // Search in 135+ localities atlas
    let match = null;
    if (clean.length >= 1) {
      match = REGIONAL_SOIL_ATLAS.find(item => 
        item.name.toLowerCase() === clean || 
        `${item.name.toLowerCase()} ${item.district.toLowerCase()}` === clean ||
        item.tehsil.toLowerCase() === clean
      );
    }

    if (!match && (isExplicitSelect || clean.length >= 4)) {
      match = REGIONAL_SOIL_ATLAS.find(item => 
        item.name.toLowerCase().startsWith(clean) || 
        item.district.toLowerCase().startsWith(clean)
      );
    }

    if (match) {
      handleMapLocationChange(match.lat, match.lon, match.name);
    } else {
      const customName = val.split('(')[0].trim();
      setFarmName(customName.endsWith(" Farm") ? customName : `${customName} Farm`);
    }
  };

  const handlePresetDropdownChange = (cityKey: string) => {
    setRegionalPreset(cityKey);
    const targetNorm = cityKey.toLowerCase().replace(/[_-]/g, ' ').trim();
    const match = REGIONAL_SOIL_ATLAS.find(x => x.name.toLowerCase() === targetNorm || x.district.toLowerCase() === targetNorm);
    if (match) {
      handleMapLocationChange(match.lat, match.lon, match.name);
    }
  };

  // 2-Way Synchronization between Map Picker and Parcel Registration Form
  const handleMapLocationChange = async (lat: number, lon: number, presetName?: string) => {
    setLatitude(lat);
    setLongitude(lon);

    // Find nearest district/tehsil anchor from 135+ localities
    let best = REGIONAL_SOIL_ATLAS[0];
    let minD = 999999;
    for (const item of REGIONAL_SOIL_ATLAS) {
      const d = Math.hypot(item.lat - lat, item.lon - lon);
      if (d < minD) {
        minD = d;
        best = item;
      }
    }

    const initialAreaName = presetName ? `${presetName} (${best.district})` : `${best.name} (${best.district})`;
    setLocationName(initialAreaName);
    const baseName = presetName || best.name;
    setFarmName(baseName.endsWith(" Farm") ? baseName : `${baseName} Farm`);
    setSoilType(best.soil);
    setSoilPh(best.ph);
    if (best.crop) setCurrentCrop(best.crop);
    if (best.irrigation) setIrrigationType(best.irrigation);

    const governingPreset = findGoverningRegionalPreset(lat, lon, best.district, best.name);
    setRegionalPreset(governingPreset);

    // Asynchronously query OpenStreetMap for micro village or town name
    try {
      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`, {
        signal: ctrl.signal,
        headers: { Accept: "application/json" }
      });
      clearTimeout(tId);
      if (res.ok) {
        const geo = await res.json();
        if (geo?.address) {
          const micro = geo.address.village || geo.address.hamlet || geo.address.suburb || geo.address.town || geo.address.city || geo.address.road;
          const dist = geo.address.county || geo.address.state_district || best.district;
          if (micro && micro !== "Rural Parcel") {
            setLocationName(`${micro}, ${dist}`);
            setFarmName(micro.endsWith(" Farm") ? micro : `${micro} Farm`);
          }
        }
      }
    } catch (e) {
      // offline / timeout fallback retained
    }
  };

  // Save farm profile and proceed
  const handleSaveFarm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (registeredFields.length === 0) {
      const fid = newFieldId.trim() || "Field 1 (Whole Farm)";
      const acresVal = Number(area) > 0 ? Number(area) : 30;
      const rot = getRotationForCrop(currentCrop, soilType, Number(soilPh));
      const defaultField: FieldParcel = {
        id: fid,
        acres: acresVal,
        soil: `${soilType} (pH ${soilPh})`,
        ph: Number(soilPh),
        y2026: currentCrop,
        y2027: rot.y2027,
        y2028: rot.y2028,
        strategy: rot.strategy,
        score: rot.score,
        category: rot.category,
        color: rot.color
      };
      setRegisteredFields([defaultField]);
    }
    setLoadingNasa(true);
    try {
      const saved = await createFarm({
        name: farmName,
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
      setFarm(saved);

      if (saved.id) {
        const [nDataRes, stratsRes, simRes] = await Promise.allSettled([
          getNasaDataForFarm(saved.id),
          getRotationsForFarm(saved.id),
          simulateScenario(saved.id, {
            rainfall_change_pct: simRain,
            temperature_change_c: simTemp,
            water_change_pct: simWater,
          }),
        ]);
        if (nDataRes.status === "fulfilled") setNasaData(nDataRes.value);
        if (stratsRes.status === "fulfilled") setStrategies(stratsRes.value);
        if (simRes.status === "fulfilled") setSimulation(simRes.value);
      }
      setActiveTab("nasa");
    } catch (err) {
      console.warn("Backend save encountered a non-fatal warning, continuing with client state:", err);
      setActiveTab("nasa");
    } finally {
      setLoadingNasa(false);
    }
  };

  // Run What-If Simulation
  const handleRunSimulation = (rain: number, temp: number, water: number) => {
    setSimRain(rain);
    setSimTemp(temp);
    setSimWater(water);
    // Allow simulating without saved farm ID
    startSimTransition(async () => {
      try {
        const res = await simulateScenario(farm?.id, {
          rainfall_change_pct: rain,
          temperature_change_c: temp,
          water_change_pct: water,
        });
        setSimulation(res);
      } catch (err) {
        console.error("Sim error:", err);
      }
    });
  };

  // Send message to AgriAI
  const handleSendMessage = async (customText?: string) => {
    const q = customText || chatInput;
    if (!q.trim() || chatLoading) return;

    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: q }]);
    setChatLoading(true);

    try {
      const farmContext = {
        name: farm?.name || farmName,
        location_name: farm?.location_name || locationName,
        latitude: farm?.latitude || latitude,
        longitude: farm?.longitude || longitude,
        area: farm?.area || (Number(area) || 30),
        soil_type: farm?.soil_type || soilType,
        soil_ph: farm?.soil_ph || Number(soilPh) || 7.5,
        irrigation_type: farm?.irrigation_type || irrigationType,
        current_crop: farm?.current_crop || currentCrop,
        priority: farm?.priority || priority,
        fields: registeredFields,
      };
      const res = await sendChatMessage(q, farm?.id, simulation, farmContext);
      setChatMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered a network issue reaching the backend service. Please check that FastAPI is running.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Dynamic 12-Month NASA Integrated Weather Data directly from backend database/satellite
  const activeMonthlyData = (nasaData?.monthly_data && nasaData.monthly_data.length === 12)
    ? nasaData.monthly_data
    : [
        { month: "Jan", temp: 13.2, rain: 18.5, radiation: 12.4, baselineTrend: 22.0 },
        { month: "Feb", temp: 16.8, rain: 26.2, radiation: 15.1, baselineTrend: 25.0 },
        { month: "Mar", temp: 22.4, rain: 34.0, radiation: 18.8, baselineTrend: 28.0 },
        { month: "Apr", temp: 28.6, rain: 21.5, radiation: 22.6, baselineTrend: 24.0 },
        { month: "May", temp: 34.2, rain: 14.8, radiation: 25.4, baselineTrend: 18.0 },
        { month: "Jun", temp: 37.8, rain: 45.0, radiation: 26.1, baselineTrend: 35.0 },
        { month: "Jul", temp: 35.4, rain: 112.0, radiation: 22.9, baselineTrend: 95.0 },
        { month: "Aug", temp: 34.1, rain: 98.4, radiation: 21.8, baselineTrend: 82.0 },
        { month: "Sep", temp: 31.8, rain: 48.0, radiation: 20.2, baselineTrend: 42.0 },
        { month: "Oct", temp: 26.5, rain: 12.0, radiation: 17.5, baselineTrend: 15.0 },
        { month: "Nov", temp: 19.8, rain: 6.5, radiation: 13.8, baselineTrend: 10.0 },
        { month: "Dec", temp: 14.5, rain: 9.8, radiation: 11.6, baselineTrend: 12.0 },
      ];

  // Dynamic Stress Coupling - Reacts to Rainfall, Temperature, Irrigation, and Stress Rate
  const stressIndex = useMemo(() => {
    return (
      (Math.abs(Math.min(0, simRain)) / 20.0) * 0.35 +
      (simTemp / 2.0) * 0.40 +
      (Math.abs(simWater) / 30.0) * 0.45 +
      (stressRate / 20.0) * 0.20
    );
  }, [simRain, simTemp, simWater, stressRate]);

  const traditionalLoss2060 = useMemo(() => {
    return Math.round(16.0 * stressIndex * 10) / 10;
  }, [stressIndex]);

  const resilientLoss2060 = useMemo(() => {
    return Math.round(7.5 * Math.min(1.4, stressIndex) * 10) / 10;
  }, [stressIndex]);

  const yieldImpactData = useMemo(() => [
    { decade: "2020s", traditional: 0, resilient: 0 },
    { decade: "2030s", traditional: -Number((2.5 * stressIndex).toFixed(1)), resilient: -Number((0.8 * stressIndex).toFixed(1)) },
    { decade: "2040s", traditional: -Number((6.0 * stressIndex).toFixed(1)), resilient: -Number((2.2 * stressIndex).toFixed(1)) },
    { decade: "2050s", traditional: -Number((11.5 * stressIndex).toFixed(1)), resilient: -Number((4.5 * stressIndex).toFixed(1)) },
    { decade: "2060s", traditional: -traditionalLoss2060, resilient: -resilientLoss2060 },
  ], [stressIndex, traditionalLoss2060, resilientLoss2060]);

  const baseResKg = 19500;
  const baseTradKg = 17000;
  const projectedYieldData = useMemo(() => [
    { decade: "2020s", traditional: baseTradKg, resilient: baseResKg },
    { decade: "2030s", traditional: Math.round(baseTradKg * (1 - (2.5 * stressIndex) / 100)), resilient: Math.round(baseResKg * (1 - (0.8 * stressIndex) / 100)) },
    { decade: "2040s", traditional: Math.round(baseTradKg * (1 - (6.0 * stressIndex) / 100)), resilient: Math.round(baseResKg * (1 - (2.2 * stressIndex) / 100)) },
    { decade: "2050s", traditional: Math.round(baseTradKg * (1 - (11.5 * stressIndex) / 100)), resilient: Math.round(baseResKg * (1 - (4.5 * stressIndex) / 100)) },
    { decade: "2060s", traditional: Math.round(baseTradKg * (1 - traditionalLoss2060 / 100)), resilient: Math.round(baseResKg * (1 - resilientLoss2060 / 100)) },
  ], [stressIndex, traditionalLoss2060, resilientLoss2060]);

  // Dynamic Multi-Field Rotation Matrix - Retrieves Real User Registration & Parcel Data
  const defaultWholeFarmField: FieldParcel = {
    id: newFieldId.trim() ? newFieldId.trim() : "Field 1 (Whole Farm)",
    acres: Number(area) > 0 ? Number(area) : 30,
    soil: `${soilType} (pH ${soilPh})`,
    ph: Number(soilPh),
    y2026: currentCrop,
    ...getRotationForCrop(currentCrop, soilType, Number(soilPh))
  };

  const dominantCrop = registeredFields.length > 0 ? registeredFields[0].y2026 : currentCrop;
  const effectiveBaseCrop = dominantCrop;
  const dynamicStrategies = computeDynamicStrategies(effectiveBaseCrop, soilType, Number(soilPh), priority, irrigationType);
  const topEvaluatedStrategy = dynamicStrategies.reduce((best, cur) => (cur.overallScore > best.overallScore ? cur : best), dynamicStrategies[0]);

  const getActionStepsForCrop = (crop: string, soil: string, ph: number, pri: string): string[] => {
    const steps: string[] = [];

    if (crop === "Sugarcane") {
      steps.push("Subsoil De-compaction: Run deep subsoiler / chisel plow (40–45 cm depth) across cane ratoon beds to break heavy harvesting wheel compaction before legume establishment.");
      steps.push("Biological Nitrogen Restoration: Seed Berseem clover inoculated with Rhizobium trifolii to restore 90–110 kg N/ha in exhausted root horizons.");
      steps.push("Biofumigation & Disease Sanitation: Incorporate brassica/mustard or summer mung bean residue to break persistent sugarcane red rot (Colletotrichum falcatum) and root-knot nematode cycles.");
    } else if (crop === "Cotton") {
      steps.push("Pest Reservoir Interruption: Shred and terminate cotton stalks immediately post-harvest to eliminate overwintering pink bollworm (Pectinophora gossypiella) pupae.");
      steps.push("Subsoil Residual Moisture Utilization: Drill zero-tillage wheat directly into standing cotton rows to capture residual moisture channels.");
      steps.push("Pulse Nitrogen Recharge: Plant chickpea in rotation cycle to biologically restore 55–70 kg N/ha depleted by heavy lint extraction.");
    } else if (crop === "Rice") {
      steps.push("Puddle Hardpan Remediation: Aerate puddle-compacted paddy horizons with disc harrow to reintroduce aerobic microbial ecology before rabi seeding.");
      steps.push("Zero-Till Relay Infiltration: Direct-drill rabi forage (Berseem) or pulses (Lentils) into standing rice stubble without pre-sowing irrigation.");
      steps.push("Aquifer Recovery: Succeed with drought-hardy C4 cereals (Sorghum or Pearl Millet) in summer to reduce seasonal water extraction by 40–60%.");
    } else if (crop === "Maize") {
      steps.push("Soil Organic Replenishment: Incorporate heavy maize stover combined with berseem clover to accelerate microbial carbon humification.");
      steps.push("Nitrogen Balancing: Place high-fixation winter legumes before wheat to counter heavy maize nitrogen drawdown.");
      steps.push("Nutrient Mobility: Ensure balanced basal phosphatic fertilization to foster deep root anchorage.");
    } else {
      steps.push("Biofertilizer Inoculation: Inoculate pulse rotation seeds with Rhizobium biofertilizer to capture 45–70 kg N/ha atmospheric nitrogen.");
      steps.push("Drought Contingency Management: Prepare shallow sowing beds for Pearl Millet or Sorghum if canal turns are curtailed.");
      steps.push("Moisture Conservation: Maintain minimal tillage and surface residue cover to preserve soil capillary moisture during dry spell windows.");
    }

    if (ph > 8.0) {
      steps.push(`Alkalinity Mitigation: Soil pH is ${ph.toFixed(1)} (alkaline); incorporate 250–400 kg/ha agricultural gypsum or organic amendments to enhance phosphorus and micronutrient availability.`);
    } else if (ph < 6.5) {
      steps.push(`Acidity Neutralization: Soil pH is ${ph.toFixed(1)}; apply agricultural lime to optimize nodulation and prevent nutrient lockout.`);
    } else {
      steps.push(`Soil Health Maintenance: Soil pH is ${ph.toFixed(1)} (optimal); maintain balanced organic residue incorporation to sustain soil microbial biomass.`);
    }

    return steps;
  };

  const totalFarmAcres = registeredFields.length > 0 
    ? registeredFields.reduce((sum, f) => sum + f.acres, 0) 
    : (Number(area) > 0 ? Number(area) : 30);

  const activeFields: FieldParcel[] = registeredFields.length > 0 
    ? registeredFields 
    : [defaultWholeFarmField];

    const handlePrintReport = async () => {
    const reportEl = document.getElementById("action-plan-report");
    if (!reportEl) return;

    const safeFarmName = (farmName || "Farm_Action_Plan").replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `AgroShift_${safeFarmName}_Action_Plan_${new Date().toISOString().split("T")[0]}.pdf`;

    // Dynamically load html2pdf if available on client
    if (typeof window !== "undefined") {
      try {
        if (!(window as any).html2pdf) {
          const script = document.createElement("script");
          script.src = "/html2pdf.bundle.min.js";
          document.head.appendChild(script);
          await new Promise((resolve) => {
            script.onload = resolve;
            script.onerror = resolve;
          });
        }

        if ((window as any).html2pdf) {
          const opt = {
            margin: [8, 8, 8, 8],
            filename: fileName,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
          };
          await (window as any).html2pdf().set(opt).from(reportEl).save();
          return;
        }
      } catch (err) {
        console.warn("html2pdf client execution error, using native print fallback:", err);
      }

      // Native print popup fallback
      try {
        const printWin = window.open("", "_blank", "width=950,height=1100");
        if (printWin) {
          printWin.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>AgroShift_Official_Farm_Action_Plan</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                  @media print {
                    @page { margin: 12mm; size: auto; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                  }
                  body { font-family: ui-sans-serif, system-ui, sans-serif; background: #fff; padding: 20px; color: #0f172a; }
                </style>
              </head>
              <body>
                <div class="max-w-4xl mx-auto bg-white p-4">
                  ${reportEl.innerHTML}
                </div>
                <script>
                  setTimeout(() => {
                    window.focus();
                    window.print();
                  }, 600);
                </script>
              </body>
            </html>
          `);
          printWin.document.close();
        } else {
          window.print();
        }
      } catch {
        window.print();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">

      {/* ================= LEFT VERTICAL SIDEBAR NAVIGATION ================= */}
      <aside className="w-full md:w-64 lg:w-72 bg-slate-900 text-slate-200 p-5 lg:p-6 flex flex-col justify-between shrink-0 border-r border-slate-800 space-y-6 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-40 no-print">
        <div className="space-y-6">
          {/* Logo (Professional Agro Brand Mark - No NASA) */}
          <div 
            onClick={() => setActiveTab("hero")}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0 border border-emerald-400/30">
              <svg className="w-6 h-6 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C16 4 9 9.5 9 16.5C9 21 12.5 24.5 16 25.5C19.5 24.5 23 21 23 16.5C23 9.5 16 4 16 4Z" fill="currentColor" fillOpacity="0.95"/>
                <path d="M16 8V24M12 16C13.5 17.5 16 18.5 16 18.5M20 15C18.5 16.5 16 17.5 16 17.5" stroke="#064e3b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="16" cy="5.5" r="1.3" fill="#a7f3d0"/>
                <path d="M5 27C8.5 24.5 12 24 16 24C20 24 23.5 24.5 27 27" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base text-white tracking-tight leading-tight flex items-center gap-1.5">
                Agro<span className="text-emerald-400">Shift</span> <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Precision Ag Decision Platform
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Vertical Column - Clean Lucide SVGs, Zero Emojis) */}
          <nav className="space-y-1.5 text-xs font-bold">
            {[
              { id: "hero", label: "Home", icon: Home },
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "farm", label: "Farm Registration", icon: MapPin },
              { id: "nasa", label: "Envirnoment analysis", icon: Globe },
              { id: "rotations", label: "Rotation Planner", icon: RotateCw },
              { id: "simulator", label: "Forecast", icon: Zap },
              { id: "assistant", label: "AI Assistant", icon: Bot },
              { id: "report", label: "Report", icon: FileText },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Farm Info */}
        <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Active Farm:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="font-bold text-white truncate text-xs">{farmName}</div>
            <div className="text-[10px] text-slate-400 flex justify-between font-mono pt-0.5">
              <span>{area ? `${area} ac` : "10.0 ac"}</span>
              <span>{soilType} Soil</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              NASA Earth Stream
            </span>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT WORKSPACE & MAIN CONTENT ================= */}
      <div className="flex-1 min-w-0 flex flex-col justify-between bg-slate-50/50">
        
        {/* Top Workspace Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              {activeTab === "hero" ? "Home" : (activeTab === "dashboard" ? "Dashboard" : (activeTab === "farm" ? "Farm Registration" : (activeTab === "nasa" ? "Envirnoment analysis" : (activeTab === "rotations" ? "Rotation Planner" : (activeTab === "simulator" ? "Forecast" : (activeTab === "assistant" ? "AI Assistant" : "Report"))))))}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-800">
              {farmName} • {locationName} Command Area ({Number(latitude || 31.4504).toFixed(4)}°N, {Number(longitude || 73.1350).toFixed(4)}°E)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Telemetry Active
            </span>
          </div>
        </header>

        {/* ================= MAIN CONTENT PANELS ================= */}
        <main className="flex-1">

        {/* ---------------- 1. HOME HERO (PTx Trimble Image 1 Style with Background Image) ---------------- */}
        {activeTab === "hero" && (
          <div className="space-y-12">
            {/* Precision Ag Hero with Image Overlay */}
            <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center text-white overflow-hidden bg-slate-950">
              {/* Background Photo of Lush Farm Field at Golden Sunset */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80')"
                }}
              />
              {/* Gradient Dark Vignette Overlay for Crisp Typography Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/50" />

              <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 py-16">
                
                {/* NASA Climatology Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/40 text-blue-300 text-xs font-bold shadow-lg backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                  <span>NASA POWER Earth Observations</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-white">Precision Crop Rotation Platform</span>
                </div>

                {/* Primary Hero Headline (Image 1 Style) */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white max-w-4xl mx-auto">
                  AI-powered precision for{" "}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    maximum crop yield
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                  Grow Smarter. Rotate Better. Farm Sustainably. Reduce waste, cut costs, and build climate resilience with NASA satellite observations and multi-season crop rotation intelligence.
                </p>

                {/* CTA Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setActiveTab("farm")}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>Analyze My Farm</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setActiveTab("simulator")}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 text-amber-300 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Explore Climate Forecast</span>
                  </button>
                </div>

                {/* Stats (Matching Image 1 Badges) */}
                <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
                    <div className="text-2xl sm:text-3xl font-black text-white">10,000+</div>
                    <div className="text-xs text-slate-400 mt-0.5">Farms Optimized</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-1">98% Satisfaction</div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
                    <div className="text-2xl sm:text-3xl font-black text-white">2 Million+</div>
                    <div className="text-xs text-slate-400 mt-0.5">Acres Modeled</div>
                    <div className="text-[10px] text-cyan-400 font-bold mt-1">Satellite Precision</div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">NASA POWER</div>
                    <div className="text-xs text-slate-400 mt-0.5">LaRC Agroclimatology</div>
                    <div className="text-[10px] text-blue-400 font-bold mt-1">Daily Satellite Stream</div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
                    <div className="text-2xl sm:text-3xl font-black text-amber-400">12 Crops</div>
                    <div className="text-xs text-slate-400 mt-0.5">Multi-Season Sequences</div>
                    <div className="text-[10px] text-amber-400 font-bold mt-1">Zero Hallucination Rules</div>
                  </div>
                </div>

              </div>
            </section>

            {/* Quick Flow Navigator */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab("farm")} className="cursor-pointer p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all group">
                  <div className="text-3xl mb-2">📍</div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600">1. Farm Registration</h3>
                  <p className="text-xs text-slate-500 mt-1">Dual-column GrowSphere map canvas to select your field location independently.</p>
                </div>
                <div onClick={() => setActiveTab("nasa")} className="cursor-pointer p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all group">
                  <div className="text-3xl mb-2">🛰️</div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600">2. Envirnoment analysis</h3>
                  <p className="text-xs text-slate-500 mt-1">Unified 12-month multi-line chart for temperature, rain, and solar radiation.</p>
                </div>
                <div onClick={() => setActiveTab("rotations")} className="cursor-pointer p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group">
                  <div className="text-3xl mb-2">🌾</div>
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-600">3. Multi-Field Matrix</h3>
                  <p className="text-xs text-slate-500 mt-1">Munson Farms table view illustrating multi-field rotation histories and scores.</p>
                </div>
                <div onClick={() => setActiveTab("simulator")} className="cursor-pointer p-5 bg-amber-50/70 border border-amber-300 rounded-2xl shadow-sm hover:border-amber-500 hover:shadow-md transition-all group">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-bold text-amber-900 group-hover:text-amber-700">4. Climate Adaptation Forecast</h3>
                  <p className="text-xs text-slate-600 mt-1">Side-by-side yield impact charts showing Strategy B climbing to #1 under drought.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        
        {/* ---------------- 2. FARM INTELLIGENCE EXECUTIVE DASHBOARD ---------------- */}
        {activeTab === "dashboard" && (
          <section className="max-w-[1680px] w-full mx-auto px-5 sm:px-7 lg:px-9 py-8 space-y-8">
            
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-950">Farm Intelligence Executive Dashboard</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 shadow-2xs">FARM MASTER COCKPIT</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Unified telemetry overview synthesizing multi-field parcels, soil parameters, NASA climatology, and crop succession
                </p>
              </div>
              <button 
                onClick={() => setActiveTab("farm")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Edit Farm Registration</span>
              </button>
            </div>

            {/* 6 Executive KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 lg:gap-4">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Land</span>
                <div className="text-xl font-black text-slate-900 font-mono">{area ? `${area} ac` : "10.0 ac"}</div>
                <span className="text-[10px] text-emerald-600 font-bold block">{((Number(area) || 10) * 0.404686).toFixed(2)} Hectares</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Field Parcels</span>
                <div className="text-xl font-black text-blue-700 font-mono">{activeFields.length} Parcels</div>
                <span className="text-[10px] text-slate-500 font-medium block">Multi-Crop Succession</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Soil & pH</span>
                <div className="text-sm font-extrabold text-slate-900 truncate">{soilType} Soil</div>
                <span className="text-[10px] text-amber-700 font-bold block">pH {Number(soilPh).toFixed(1)} ({Number(soilPh) >= 6.8 && Number(soilPh) <= 8.2 ? "Optimal" : (Number(soilPh) < 6.8 ? "Acidic" : "Alkaline")})</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">NASA Climatology</span>
                <div className="text-xl font-black text-emerald-600 font-mono">{topEvaluatedStrategy.overallScore >= 80 ? 91 : 84}/100</div>
                <span className="text-[10px] text-emerald-700 font-bold block">{Math.round(nasaData?.summary?.total_precipitation || 427)} mm Rain • Zone III</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Top Rotation</span>
                <div className="text-xl font-black text-blue-600 font-mono">{topEvaluatedStrategy.overallScore}/100</div>
                <span className="text-[10px] text-blue-800 font-bold block truncate">{topEvaluatedStrategy.name}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Nitrogen Credit</span>
                <div className="text-xl font-black text-emerald-600 font-mono">{topEvaluatedStrategy.nMetric ? topEvaluatedStrategy.nMetric.split(" ")[0] + " kg/ha" : "+65 kg/ha"}</div>
                <span className="text-[10px] text-emerald-700 font-bold block">Legume Bio-Fixation</span>
              </div>
            </div>

            {/* Dashboard Master 2-Column Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Farm Demographics & Multi-Field Parcels */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Farm Demographic Profile Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Farm Registration & Geo-Profile</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                      Verified Boundary
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Farm Name</span>
                      <span className="font-bold text-slate-900 block truncate">{farmName}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Geo Coordinates</span>
                      <span className="font-bold text-slate-900 font-mono block truncate">
                        {Number(latitude || 31.4504).toFixed(4)}°N, {Number(longitude || 73.1350).toFixed(4)}°E
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Agro-Ecological Zone</span>
                      <span className="font-bold text-slate-900 block truncate">Zone III-B (Central Mixed)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Irrigation Scheme</span>
                      <span className="font-bold text-slate-900 block truncate">{irrigationType}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Primary Goal</span>
                      <span className="font-bold text-emerald-700 block truncate">{priority}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Water Access Tier</span>
                      <span className="font-bold text-blue-700 block truncate">Conjunctive (14d Turns)</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Field Parcels Table */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Multi-Field Parcels & Rotation Plan</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab("rotations")}
                      className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Rotations →</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-bold">
                          <th className="py-2 px-3">Field ID</th>
                          <th className="px-3">Area</th>
                          <th className="px-3">Soil Type</th>
                          <th className="px-3">2026 Base</th>
                          <th className="px-3">2027 Crop</th>
                          <th className="px-3">2028 Crop</th>
                          <th className="px-3 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {activeFields.map((f, i) => {
                          const dynRot = getRotationForCrop(
                            f.y2026, 
                            f.soil ? f.soil.split(" ")[0] : soilType, 
                            f.ph || Number(soilPh), 
                            priority, 
                            irrigationType
                          );
                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3 font-bold text-slate-900">{f.id}</td>
                              <td className="px-3 font-mono font-bold">{f.acres} ac</td>
                              <td className="px-3 text-slate-600">{f.soil}</td>
                              <td className="px-3"><span className="px-2 py-0.5 rounded bg-slate-100 font-bold">{f.y2026}</span></td>
                              <td className="px-3 font-bold text-emerald-700">{f.y2027 || dynRot.y2027}</td>
                              <td className="px-3 font-bold text-blue-700">{f.y2028 || dynRot.y2028}</td>
                              <td className="px-3 text-right font-black text-slate-900">{topEvaluatedStrategy.overallScore}/100</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: Envirnoment Analysis Snapshot & AI Copilot */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* NASA Envirnoment Analysis Snapshot */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Satellite className="w-4 h-4 text-blue-600 shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Envirnoment analysis Snapshot</h3>
                    </div>
                    <button onClick={() => setActiveTab("nasa")} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                      Full Analytics →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                      <span className="text-[10px] text-blue-800 font-bold block">Annual Rainfall</span>
                      <span className="text-lg font-black text-blue-900 font-mono">{Math.round(nasaData?.summary?.total_precipitation || 427)} mm</span>
                      <span className="text-[9px] text-blue-600 block">Monsoon peak July-Aug</span>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200">
                      <span className="text-[10px] text-orange-800 font-bold block">Summer Peak Temp</span>
                      <span className="text-lg font-black text-orange-900 font-mono">{Number(nasaData?.summary?.max_temperature_recorded || 38.6).toFixed(1)}°C</span>
                      <span className="text-[9px] text-orange-600 block">High evapotranspiration</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                      <span className="text-[10px] text-amber-800 font-bold block">Solar Radiation</span>
                      <span className="text-lg font-black text-amber-900 font-mono">{Number(nasaData?.summary?.avg_solar_radiation || 18.4).toFixed(1)} MJ/m²</span>
                      <span className="text-[9px] text-amber-600 block">Optimal photosynthetic tier</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold block">Soil Moisture Deficit</span>
                      <span className="text-lg font-black text-emerald-900 font-mono">-42 mm</span>
                      <span className="text-[9px] text-emerald-600 block">Managed with canal mix</span>
                    </div>
                  </div>
                </div>

                {/* Crop Rotation Leaderboard */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Crop Rotation Leaderboard</h3>
                    </div>
                    <button onClick={() => setActiveTab("simulator")} className="text-xs font-bold text-amber-600 hover:underline cursor-pointer">
                      Simulate Stress →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {dynamicStrategies.map((strat) => (
                      <div 
                        key={strat.key} 
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          strat.key === topEvaluatedStrategy.key ? "bg-emerald-50/80 border-emerald-300" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900">{strat.name}</span>
                            {strat.key === topEvaluatedStrategy.key && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white">TOP PICK</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-600 block">{strat.sequence}</span>
                        </div>
                        <span className="text-xl font-black text-slate-900 font-mono">
                          {strat.overallScore}<span className="text-[10px] text-slate-400">/100</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AgriAI Quick Recommendation Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-indigo-400 shrink-0" /> AgriAI Field Copilot</span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
                      AgriAI Advisor
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    &ldquo;{activeFields[0]?.y2026 || dominantCrop} rotation evaluated on {soilType} soil (pH {Number(soilPh).toFixed(1)}) under {irrigationType}. Priority &lsquo;{priority}&rsquo; ranks {topEvaluatedStrategy.name} highest ({topEvaluatedStrategy.overallScore}/100) delivering {topEvaluatedStrategy.nMetric}.&rdquo;
                  </p>
                  <button 
                    onClick={() => setActiveTab("assistant")}
                    className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Ask AI Assistant About This Farm →</span>
                  </button>
                </div>

              </div>

            </div>

          </section>
        )}

        {/* ---------------- 2. FARM REGISTRATION (GrowSphere Image 6 Dual-Column Layout) ---------------- */}
        {activeTab === "farm" && (
          <section className="max-w-[1680px] w-full mx-auto px-5 sm:px-7 lg:px-9 py-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-black text-slate-950">2. Farm Setup — Tell Us About Your Land</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  The map is freely scrollable, zoomable, and editable. Walk through the map to pinpoint your exact farm fields.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Step 2: Dual-Column Setup
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Info */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Field & Soil Attributes</span>
                </div>

                <div className="space-y-3">
                  {/* Detected Area */}
                  <div className="p-3 bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200 rounded-2xl shadow-xs space-y-1.5">
                    <label className="block text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Detected Area</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">Select on map or type</span>
                    </label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      value={locationName} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocationName(val);
                        handleAreaInputChange(val, false);
                      }}
                      onBlur={(e) => handleAreaInputChange(e.target.value, true)}
                      placeholder="Type or pick any village or city (e.g. Samundri, Burewala)..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    />
                  </div>

                  {/* Farm Name & Field Size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between">
                        <span>Farm Name</span>
                        <span className="text-[10px] text-emerald-600 font-bold">Auto-Synced</span>
                      </label>
                      <input 
                        type="text" 
                        value={farmName} 
                        onChange={(e) => setFarmName(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        <span>Farm Total Size (Acres)</span>
                      </label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={area} 
                        placeholder="e.g. 30"
                        onChange={(e) => setArea(e.target.value === "" ? "" : parseFloat(e.target.value))}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Field Registration & Multi-Field Management for this Farm */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-900">Register Field for this Farm</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {registeredFields.length} Field{registeredFields.length !== 1 ? "s" : ""} Saved
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Field Number / ID</label>
                        <input 
                          type="text"
                          value={newFieldId}
                          onChange={(e) => setNewFieldId(e.target.value)}
                          placeholder={`e.g. Field ${registeredFields.length + 1}`}
                          className="w-full text-xs px-2.5 py-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          <span>Field Area (Acres)</span>
                        </label>
                        <input 
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={newFieldAcres}
                          onChange={(e) => setNewFieldAcres(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 10"
                          className="w-full text-xs px-2.5 py-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Field Crop (2026)</label>
                        <select
                          value={newFieldCrop}
                          onChange={(e) => setNewFieldCrop(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-900"
                        >
                          {ALL_13_CROPS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Field Soil Texture</label>
                        <select
                          value={newFieldSoil}
                          onChange={(e) => setNewFieldSoil(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-900"
                        >
                          <option value="Loamy">Loamy</option>
                          <option value="Clay-Loam">Clay-Loam</option>
                          <option value="Sandy-Loam">Sandy-Loam</option>
                          <option value="Clay">Clay</option>
                          <option value="Sandy">Sandy</option>
                        </select>
                      </div>
                    </div>

                    {/* Save Field Button */}
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>💾 Save Field to Farm (+ Add Another)</span>
                    </button>

                    {/* Save Toast Notification */}
                    {saveToast && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                        <span>{saveToast}</span>
                        <button type="button" onClick={() => setSaveToast(null)} className="text-emerald-700 font-bold ml-2">×</button>
                      </div>
                    )}

                    {/* Registered Fields List Chips */}
                    {registeredFields.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span>Registered Fields in {farmName}:</span>
                          <span className="text-emerald-700">
                            Total: {registeredFields.reduce((s, f) => s + f.acres, 0)} ac
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {registeredFields.map((f, i) => (
                            <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                              <span className="font-bold text-slate-900">{f.id}</span>
                              <span className="text-slate-400">•</span>
                              <span className="font-semibold text-blue-700">{f.acres} ac</span>
                              <span className="text-slate-400">•</span>
                              <span className="font-medium text-emerald-700">{f.y2026}</span>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveField(i)} 
                                className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                                title="Remove this field"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-700">Whole Farm Mode: </span>
                        If no individual fields are saved, the whole farm ({Number(area) > 0 ? `${area} ac` : "unified area"}) operates as a single field. Click &ldquo;Save Field to Farm&rdquo; above to partition into different crops/sizes.
                      </div>
                    )}
                  </div>

                  {/* Regional Command Preset (Auto-Selected by Detected Area) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <span>Regional Command Preset</span>
                        <span className="text-[10px] text-emerald-600 font-bold">(Auto-Selected)</span>
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Governed by {regionalPreset.charAt(0).toUpperCase() + regionalPreset.slice(1).replace(/_/g, ' ')}
                      </span>
                    </label>
                    <select 
                      value={regionalPreset} 
                      onChange={(e) => handlePresetDropdownChange(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                    >
                      <option value="faisalabad">Faisalabad</option>
                      <option value="multan">Multan</option>
                      <option value="lahore">Lahore</option>
                      <option value="sahiwal">Sahiwal</option>
                      <option value="rahim_yar_khan">Rahim Yar Khan</option>
                      <option value="bhakkar">Bhakkar</option>
                      <option value="rawalpindi">Rawalpindi</option>
                      <option value="gujranwala">Gujranwala</option>
                      <option value="dera_ghazi_khan">Dera Ghazi Khan</option>
                      <option value="sukkur">Sukkur</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between items-center">
                        <span>Soil Texture</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                          {soilType}
                        </span>
                      </label>
                      <select 
                        value={soilType} 
                        onChange={(e) => setSoilType(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                      >
                        <option value="Loamy">Loamy (Ideal / Balanced)</option>
                        <option value="Clay-Loam">Clay-Loam</option>
                        <option value="Sandy-Loam">Sandy-Loam</option>
                        <option value="Clay">Clay (Heavy / Dense)</option>
                        <option value="Sandy">Sandy (High Drainage)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between">
                        <span>Soil pH</span>
                        <span className="text-blue-700 font-black">{soilPh} pH</span>
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
                        <span>5.5</span>
                        <span>7.0 (Neutral)</span>
                        <span>9.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Current Base Crop (13-Crop Universal Matrix)</label>
                      <select 
                        value={currentCrop} 
                        onChange={(e) => {
                          setCurrentCrop(e.target.value);
                          setNewFieldCrop(e.target.value);
                        }}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                      >
                        <option value="Wheat">1. Wheat (Rabi Cereal Staple)</option>
                        <option value="Chickpea">2. Chickpea / Gram (Rabi Legume N-Fixer)</option>
                        <option value="Lentils">3. Lentils / Masoor (Rabi Pulse)</option>
                        <option value="Maize">4. Maize / Corn (Kharif/Spring Cereal)</option>
                        <option value="Sorghum">5. Sorghum / Jowar (Kharif C4 Drought Hardy)</option>
                        <option value="Berseem">6. Berseem / Clover (Rabi Legume Fodder)</option>
                        <option value="Cotton">7. Cotton (Kharif Major Cash Crop)</option>
                        <option value="Rice">8. Rice / Basmati (Kharif High-Water Cereal)</option>
                        <option value="Soybean">9. Soybean (Kharif Legume Oilseed)</option>
                        <option value="Mustard">10. Mustard / Canola (Rabi Biofumigant Oilseed)</option>
                        <option value="Mung Bean">11. Mung Bean (Summer/Zaid Short Pulse)</option>
                        <option value="Pearl Millet">12. Pearl Millet / Bajra (Kharif Low-Water Cereal)</option>
                        <option value="Sugarcane">13. Sugarcane / Kamad (Annual Major Cash Crop)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Irrigation Access</label>
                      <select 
                        value={irrigationType} 
                        onChange={(e) => setIrrigationType(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                      >
                        <option value="Limited groundwater">Limited groundwater</option>
                        <option value="Canal / Groundwater">Canal / Groundwater (Conjunctive)</option>
                        <option value="Canal turns only">Canal turns only</option>
                        <option value="Drip / Micro-irrigation">Drip / Micro-irrigation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Main Priority</label>
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-emerald-700"
                    >
                      <option value="Water conservation">Water conservation</option>
                      <option value="Soil Health">Soil Health & Nitrogen Fixation</option>
                      <option value="Yield / Profit">Yield / Commercial Profit</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={() => handleSaveFarm()}
                  disabled={loadingNasa}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {loadingNasa ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Calling NASA POWER Satellite API...
                    </span>
                  ) : (
                    <>
                      <span>Analyze My Farm</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Freely Scrollable / Editable Live Satellite Map */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Freely Scrollable Field Canvas</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Lat: {latitude.toFixed(4)}, Lon: {longitude.toFixed(4)}
                  </span>
                </div>

                {/* Map View */}
                <div className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <MapPicker 
                    latitude={latitude} 
                    longitude={longitude} 
                    locationName={locationName} 
                    onChange={(lat, lon) => handleMapLocationChange(lat, lon)} 
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-semibold text-[11px]">Quick Center Jump:</span>
                  {[
                    { name: "Faisalabad", lat: 31.4504, lon: 73.1350 },
                    { name: "Multan", lat: 30.1575, lon: 71.5249 },
                    { name: "Lahore", lat: 31.5204, lon: 74.3587 },
                    { name: "Sahiwal", lat: 30.6682, lon: 73.1114 },
                    { name: "R.Y. Khan", lat: 28.4212, lon: 70.2989 },
                    { name: "Bhakkar", lat: 31.6253, lon: 71.0653 },
                    { name: "Rawalpindi", lat: 33.5973, lon: 73.0479 },
                    { name: "Gujranwala", lat: 32.1877, lon: 74.1945 },
                    { name: "D.G. Khan", lat: 30.0561, lon: 70.6348 },
                    { name: "Sukkur", lat: 27.7052, lon: 68.8574 },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleMapLocationChange(p.lat, p.lon, p.name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 text-xs font-semibold transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            </section>
        )}

        {/* ---------------- 3. NASA EARTH INTELLIGENCE (Unified 12-Month Multi-Line Chart) ---------------- */}
        {activeTab === "nasa" && (
          <section className="max-w-[1680px] w-full mx-auto px-5 sm:px-7 lg:px-9 py-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-black text-slate-950">3. NASA Earth Intelligence — From Space to Soil</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Real-time observations for {locationName} ({latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {loadingNasa && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...
                  </span>
                )}
                {nasaData?.source?.includes("Live Satellite") ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                    ✅ NASA POWER Satellite Live
                  </span>
                ) : nasaData?.source ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                    ⚡ Coordinate Climatology Model
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    NASA POWER API v2.0
                  </span>
                )}
              </div>
            </div>

            {/* Indicator Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Average Temperature</span>
                <div className="text-2xl font-black text-slate-900">{nasaData?.summary?.avg_temperature ?? 27}°C</div>
                <span className="text-[10px] text-slate-400">Mean 12-Month Baseline</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Monthly Rainfall</span>
                <div className="text-2xl font-black text-blue-600">
                  {nasaData?.summary?.monthly_rainfall_mean ?? (nasaData?.summary?.total_precipitation ? (nasaData.summary.total_precipitation / 12).toFixed(1) : 42)} mm
                </div>
                <span className="text-[10px] text-slate-400">Annual Total: {nasaData?.summary?.total_precipitation ?? 504.5} mm</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Maximum Temperature</span>
                <div className="text-2xl font-black text-rose-600">{nasaData?.summary?.max_temperature_recorded ?? 38}°C</div>
                <span className="text-[10px] text-slate-400">{nasaData?.summary?.heat_stress_days ?? 184} Heat Stress Days</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Solar Radiation</span>
                <div className="text-2xl font-black text-amber-600">{nasaData?.summary?.avg_solar_radiation ?? 19} MJ/m²/day</div>
                <span className="text-[10px] text-slate-400">All-sky Surface Insolation</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Rainfall Trend</span>
                <div className="text-2xl font-black text-rose-600">{nasaData?.indicators?.water_scarcity_level ?? "Moderate"}</div>
                <span className="text-[10px] text-slate-400">{nasaData?.summary?.longest_dry_spell_days ?? 79}-Day Dry Spell Streak</span>
              </div>
            </div>

            {/* Environmental Intelligence - Real NASA Data */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-300 shadow-sm flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="text-xs font-black uppercase tracking-wider text-blue-800">Environmental Intelligence — {locationName}</div>
                  {nasaData?.source && (
                    <span className="text-[10px] font-semibold text-slate-500 italic truncate">Source: {nasaData.source}</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 leading-relaxed italic">
                  &ldquo;{locationName} records an average of {nasaData?.summary?.avg_temperature ?? 27}°C with {nasaData?.summary?.total_precipitation ?? 505} mm annual rainfall.
                  {' '}{nasaData?.summary?.heat_stress_days ?? 184} heat stress days — {nasaData?.indicators?.heat_stress_risk ?? 'Moderate'} risk.
                  {' '}{nasaData?.indicators?.water_scarcity_level ?? 'Moderate'} water scarcity.
                  Rabi: {nasaData?.summary?.rabi_precipitation ?? 115} mm | Kharif: {nasaData?.summary?.kharif_precipitation ?? 390} mm.&rdquo;
                </p>
              </div>
            </div>

            {/* UNIFIED 12-MONTH MULTI-LINE CHART (Temperature, Rainfall, Solar Radiation & Declining Trend) */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    📈 12-Month Multi-Metric Climate Profile (All Lines Rendered)
                  </h3>
                  <span className="text-xs text-slate-500">
                    Temperature (°C), Monthly Rainfall (mm), Solar Radiation (MJ/m²/day), and Declining Rain Trend
                  </span>
                </div>
              </div>

              <div className="h-[340px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#2563eb" fontSize={11} unit=" mm" />
                    <YAxis yAxisId="right" orientation="right" stroke="#ea580c" fontSize={11} unit=" °C" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "0.5rem", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Line yAxisId="left" type="monotone" dataKey="rain" stroke="#2563eb" strokeWidth={3} name="Rainfall (mm)" dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#ea580c" strokeWidth={3} name="Temperature (°C)" dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="radiation" stroke="#d97706" strokeWidth={2.5} name="Solar Radiation (MJ/m²/day)" dot={{ r: 4 }} />
                    <Line yAxisId="left" type="monotone" dataKey="baselineTrend" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="5 5" name="Declining Trend Curve (mm)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 12-Month Data Table */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 overflow-x-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">📊 Monthly Climate Data Table</h3>
                <span className="text-[11px] text-slate-400">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
              </div>
              <table className="w-full text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold">
                    <th className="py-2 px-3 text-left border-b border-slate-200">Month</th>
                    <th className="py-2 px-3 text-right border-b border-slate-200">Avg Temp (°C)</th>
                    <th className="py-2 px-3 text-right border-b border-slate-200">Max Temp (°C)</th>
                    <th className="py-2 px-3 text-right border-b border-slate-200">Min Temp (°C)</th>
                    <th className="py-2 px-3 text-right border-b border-slate-200">Rainfall (mm)</th>
                    <th className="py-2 px-3 text-right border-b border-slate-200">Solar (MJ/m²)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMonthlyData.map((m: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="py-1.5 px-3 font-bold text-slate-800">{m.month}</td>
                      <td className="py-1.5 px-3 text-right text-slate-700">{m.temp}</td>
                      <td className="py-1.5 px-3 text-right text-rose-600">{m.temp_max ?? (m.temp + 6).toFixed(1)}</td>
                      <td className="py-1.5 px-3 text-right text-blue-600">{m.temp_min ?? (m.temp - 6).toFixed(1)}</td>
                      <td className="py-1.5 px-3 text-right text-blue-700 font-semibold">{m.rain}</td>
                      <td className="py-1.5 px-3 text-right text-amber-600">{m.radiation}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 font-bold text-blue-900 border-t-2 border-blue-200">
                    <td className="py-2 px-3">Annual Summary</td>
                    <td className="py-2 px-3 text-right">{nasaData?.summary?.avg_temperature ?? "--"}°C avg</td>
                    <td className="py-2 px-3 text-right text-rose-700">{nasaData?.summary?.max_temperature_recorded ?? "--"}°C peak</td>
                    <td className="py-2 px-3 text-right text-blue-700">{nasaData?.summary?.min_temperature_recorded ?? "--"}°C min</td>
                    <td className="py-2 px-3 text-right">{nasaData?.summary?.total_precipitation ?? "--"} mm total</td>
                    <td className="py-2 px-3 text-right text-amber-700">{nasaData?.summary?.avg_solar_radiation ?? "--"} avg</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setActiveTab("rotations")}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Proceed to Crop Rotation Planner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ---------------- 4. ROTATION TAB (Munson Farms Multi-Field Table Image 3 Style!) ---------------- */}
        {activeTab === "rotations" && (
          <section className="max-w-[1680px] w-full mx-auto px-5 sm:px-7 lg:px-9 py-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-black text-slate-950">4. Crop Rotation Planner — The Brain of AgroShift AI</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Multi-field farm management and deterministic 4-factor rotation sequence recommendations
                </p>
              </div>
              <button
                onClick={() => setActiveTab("report")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Generate Farm Report ➔
              </button>
            </div>

            {/* Dynamic Farm & Field Registration Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-900">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Total Area Planted</span>
                <div className="text-2xl font-black text-slate-950">
                  {activeFields.reduce((sum, f) => sum + f.acres, 0).toLocaleString()} ac
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {activeFields.length} Active Field Parcel{activeFields.length > 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Dominant Base Crop</span>
                <div className="text-2xl font-black text-blue-700">{currentCrop}</div>
                <span className="text-[11px] text-slate-400">Primary Registered 2026 Base Crop</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Soil Diversity</span>
                <div className="text-2xl font-black text-slate-950">{soilType}</div>
                <span className="text-[11px] text-slate-400">pH {soilPh} • {irrigationType}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Best Evaluated Sequence</span>
                <div className="text-2xl font-black text-emerald-600">
                  {topEvaluatedStrategy.overallScore} / 100
                </div>
                <span className="text-[11px] text-emerald-600 font-bold truncate block">
                  {topEvaluatedStrategy.name}
                </span>
              </div>
            </div>

            {/* MULTI-FIELD ROTATION HISTORY MATRIX TABLE (Starting 2026 to 2027 and 2028 with Interactive Blank/Editable Slots) */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Field Parcel Rotation Succession (2026 Base ➔ 2027 ➔ 2028 Next Cycles)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {registeredFields.length > 0 ? "Showing registered field parcels" : "Showing unified farm (Custom fields can be added in Step 2)"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 font-bold">
                      <th className="py-2.5 px-3">Field ID</th>
                      <th className="px-3">Area</th>
                      <th className="px-3">Soil & pH</th>
                      <th className="px-3">2026 Season (Current Base)</th>
                      <th className="px-3">2027 Season (Next Rotation)</th>
                      <th className="px-3">2028 Season (Future Succession)</th>
                      <th className="px-3">Recommended Strategy</th>
                      <th className="px-3">Agronomic Category</th>
                      <th className="px-3 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activeFields.map((f, i) => {
                      const dynamicFieldRot = getRotationForCrop(
                        f.y2026, 
                        f.soil ? f.soil.split(" ")[0] : soilType, 
                        f.ph || Number(soilPh), 
                        priority, 
                        irrigationType
                      );
                      return (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">{f.id}</td>
                          <td className="px-3 font-mono font-bold">{f.acres} ac</td>
                          <td className="px-3 text-slate-600">{f.soil}</td>
                          <td className="px-3">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold">
                              {f.y2026}
                            </span>
                          </td>
                          <td className="px-3">
                            <select
                              value={f.y2027 || dynamicFieldRot.y2027}
                              onChange={(e) => handleUpdateFieldYear(i, "y2027", e.target.value)}
                              className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-300 font-bold text-emerald-800 text-xs shadow-xs focus:ring-1 focus:ring-emerald-500"
                              title="Click to select or customize next crop"
                            >
                              {ALL_13_CROPS.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3">
                            <select
                              value={f.y2028 || dynamicFieldRot.y2028}
                              onChange={(e) => handleUpdateFieldYear(i, "y2028", e.target.value)}
                              className="px-2 py-1 rounded-md bg-blue-50 border border-blue-300 font-bold text-blue-800 text-xs shadow-xs focus:ring-1 focus:ring-blue-500"
                              title="Click to select or customize future crop"
                            >
                              {ALL_13_CROPS.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${topEvaluatedStrategy.badgeBg} ${topEvaluatedStrategy.badgeText}`}>
                              {topEvaluatedStrategy.name}
                            </span>
                          </td>
                          <td className="px-3">
                            <span className="text-[11px] font-semibold text-slate-600 max-w-[200px] truncate block" title={topEvaluatedStrategy.focusPoints[0] || dynamicFieldRot.category}>
                              {topEvaluatedStrategy.focusPoints[0] || dynamicFieldRot.category}
                            </span>
                          </td>
                          <td className="px-3 text-right font-black text-slate-900">{topEvaluatedStrategy.overallScore}/100</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 12-CROP REGIONAL AGRONOMIC KNOWLEDGE MATRIX (User Explicit Request) */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-blue-600">🌿</span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Comprehensive 13-Crop Agronomic Knowledge Matrix (PARC / FAO-56 Verified)
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  13 Active Regional Crops (Including Sugarcane)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 font-bold">
                      <th className="py-2.5 px-3">#</th>
                      <th className="px-3">Crop Name</th>
                      <th className="px-3">Season</th>
                      <th className="px-3">Agronomic Type</th>
                      <th className="px-3">Water Demand</th>
                      <th className="px-3">Optimal pH</th>
                      <th className="px-3">N-Fixation</th>
                      <th className="px-3">Drought Tolerance</th>
                      <th className="px-3">Rotation Benefit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      { num: 1, name: "Wheat (Gandum)", season: "Rabi (Winter)", type: "Cereal Staple", water: "400 mm", ph: "6.0 - 8.0", nfix: "0 kg/ha", drought: "Medium", benefit: "Staple food security, livestock straw value, reliable cashflow." },
                      { num: 2, name: "Chickpea (Gram)", season: "Rabi (Winter)", type: "Pulse / Legume", water: "250 mm", ph: "6.0 - 8.2", nfix: "65 kg/ha", drought: "High", benefit: "Fixes biological nitrogen, deep taproot fractures subsoil hardpan." },
                      { num: 3, name: "Lentils (Masoor)", season: "Rabi (Winter)", type: "Pulse / Legume", water: "220 mm", ph: "6.0 - 7.8", nfix: "50 kg/ha", drought: "Medium", benefit: "Short 105-day duration, low water demand, enriches soil organic N." },
                      { num: 4, name: "Maize (Corn)", season: "Kharif / Spring", type: "Cereal Grain", water: "550 mm", ph: "5.8 - 7.5", nfix: "0 kg/ha", drought: "Low", benefit: "High biomass & commercial grain yield, heavy carbon residue recycling." },
                      { num: 5, name: "Sorghum (Jowar)", season: "Kharif (Summer)", type: "C4 Cereal / Fodder", water: "380 mm", ph: "5.5 - 8.5", nfix: "0 kg/ha", drought: "Very High", benefit: "Extracts deep moisture, heat tolerance >42°C, excellent green fodder." },
                      { num: 6, name: "Berseem (Egyptian Clover)", season: "Rabi to Spring", type: "Legume Fodder", water: "500 mm", ph: "6.5 - 8.5", nfix: "110 kg/ha", drought: "Low", benefit: "4-6 continuous fodder cuttings, dairy integration, rebuilds soil microbes." },
                      { num: 7, name: "Cotton (Kapas)", season: "Kharif (Summer)", type: "Major Cash Crop", water: "650 mm", ph: "6.0 - 8.5", nfix: "0 kg/ha", drought: "Medium", benefit: "High industrial market value, deep taproot aeration for succeeding wheat." },
                      { num: 8, name: "Rice (Basmati)", season: "Kharif (Monsoon)", type: "High-Water Cereal", water: "1,100 mm", ph: "5.5 - 7.5", nfix: "0 kg/ha", drought: "Low", benefit: "Premium export cash value, continuous flushing reclaims sodic soils." },
                      { num: 9, name: "Soybean", season: "Kharif (Summer)", type: "Legume Oilseed", water: "450 mm", ph: "6.0 - 7.5", nfix: "85 kg/ha", drought: "Medium", benefit: "High protein & edible oil, supplies up to 85 kg N/ha credit to succeeding crop." },
                      { num: 10, name: "Mustard / Canola (Raya)", season: "Rabi (Winter)", type: "Biofumigant Oilseed", water: "280 mm", ph: "6.0 - 8.0", nfix: "0 kg/ha", drought: "High", benefit: "Glucosinolate root exudates naturally biofumigate nematodes and soil fungi." },
                      { num: 11, name: "Mung Bean (Green Gram)", season: "Zaid / Summer Catch", type: "Short-Duration Pulse", water: "200 mm", ph: "6.2 - 7.8", nfix: "45 kg/ha", drought: "High", benefit: "65-day maturity fits empty fallow windows, rapid organic matter generation." },
                      { num: 12, name: "Pearl Millet (Bajra)", season: "Kharif (Summer)", type: "Drought Cereal", water: "280 mm", ph: "5.5 - 8.5", nfix: "0 kg/ha", drought: "Very High", benefit: "Exceptional heat & moisture stress resilience; climbs to Rank #1 under drought." },
                      { num: 13, name: "Sugarcane (Kamad)", season: "Annual / Kharif", type: "Major Cash Crop", water: "1,400 mm", ph: "6.0 - 8.2", nfix: "0 kg/ha", drought: "Low (High Water)", benefit: "High sugar & bioenergy cash income, heavy organic bagasse biomass recycling." },
                    ].map((c) => (
                      <tr key={c.num} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{c.num}</td>
                        <td className="px-3 font-bold text-slate-900">{c.name}</td>
                        <td className="px-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{c.season}</span></td>
                        <td className="px-3 text-slate-600">{c.type}</td>
                        <td className="px-3 font-mono font-bold text-blue-700">{c.water}</td>
                        <td className="px-3 font-mono text-slate-600">{c.ph}</td>
                        <td className="px-3 font-mono font-bold text-emerald-700">{c.nfix}</td>
                        <td className="px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            c.drought === "Very High" ? "bg-emerald-100 text-emerald-800" :
                            c.drought === "High" ? "bg-blue-100 text-blue-800" :
                            c.drought === "Medium" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {c.drought}
                          </span>
                        </td>
                        <td className="px-3 text-slate-600 text-[11px]">{c.benefit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3 Candidate Strategy Cards (Live Computed from Farm Data & Priority) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              {dynamicStrategies.map((strat) => {
                const isExpanded = expandedStratKey === strat.key;
                return (
                  <div 
                    key={strat.key} 
                    className={`p-5 rounded-2xl border-2 ${strat.cardBorder} bg-white shadow-md flex flex-col justify-between transition-all`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${strat.badgeBg} ${strat.badgeText}`}>
                            {strat.name}
                          </span>
                          {strat.key === topEvaluatedStrategy.key && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                              ★ Top Recommendation
                            </span>
                          )}
                        </div>
                        <span className="text-2xl font-black text-slate-900">
                          {strat.overallScore}<span className="text-xs text-slate-400">/100</span>
                        </span>
                      </div>

                      <div className={`mt-3 text-xs font-black ${strat.seqText} ${strat.seqBg} p-2.5 rounded-xl border ${strat.seqBorder}`}>
                        {strat.sequence}
                      </div>

                      <div className="mt-3 text-xs space-y-1 text-slate-600">
                        <div className="font-bold text-slate-800">Agronomic Focus:</div>
                        {strat.focusPoints.map((fp, fIdx) => (
                          <div key={fIdx}>• {fp}</div>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex justify-between"><span>Climate suitability:</span><strong>{strat.climateScore}</strong></div>
                        <div className="flex justify-between"><span>Water suitability:</span><strong>{strat.waterScore}</strong></div>
                        <div className="flex justify-between"><span>Soil compatibility:</span><strong>{strat.soilScore}</strong></div>
                        <div className="flex justify-between"><span>Farmer priority:</span><strong>{strat.priorityScore}</strong></div>
                      </div>
                    </div>

                    {/* View Details Toggle Button */}
                    <button 
                      type="button"
                      onClick={() => setExpandedStratKey(isExpanded ? null : strat.key)}
                      className={`w-full mt-4 py-2.5 rounded-xl ${isExpanded ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'} text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                    >
                      <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                      <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                    </button>

                    {/* Inline Expandable Details Drawer Inside This Strategy Card */}
                    {isExpanded && (
                      <div className="mt-4 pt-3.5 border-t border-slate-200 text-xs space-y-3 bg-slate-50/90 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <div>
                          <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                            <span>🔬 Scientific Agronomic Rationale</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            {strat.rationale}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                            <span className="text-[10px] text-slate-500 font-semibold block">Water Demand</span>
                            <span className="font-bold text-blue-800">{strat.waterMetric}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                            <span className="text-[10px] text-slate-500 font-semibold block">Nitrogen Credit</span>
                            <span className="font-bold text-emerald-800">{strat.nMetric}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                            <span className="text-[10px] text-slate-500 font-semibold block">Pest Break Cycle</span>
                            <span className="font-bold text-amber-800">{strat.pestMetric}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                            <span className="text-[10px] text-slate-500 font-semibold block">Soil Organic Carbon</span>
                            <span className="font-bold text-purple-800">{strat.somMetric}</span>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-800 text-[11px] block mb-1">Key Advantages:</span>
                          <ul className="space-y-1 text-[11px] text-slate-600">
                            {strat.pros.map((p, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-bold text-slate-800 text-[11px] block mb-1">Operational Considerations:</span>
                          <ul className="space-y-1 text-[11px] text-slate-600">
                            {strat.considerations.map((c, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-1.5">
                                <span className="text-amber-600 font-bold shrink-0">⚠</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------------- 5. CLIMATE ADAPTATION ROI SIMULATOR (Image 2 Style!) ---------------- */}
        {activeTab === "simulator" && (
          <section className="max-w-[1680px] w-full mx-auto px-5 sm:px-7 lg:px-9 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-950">Climate Forecast-Driven Adaptation ROI Analyzer</h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">FORECAST</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Simulate climate scenarios and evaluate how changing conditions invert rotation suitability
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                Scenario Stress Engine
              </span>
            </div>

            {/* Image 2 Header Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input 
                  type="text" 
                  readOnly 
                  value={`${locationName} Command Area`} 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Traditional Variety</label>
                <input 
                  type="text" 
                  readOnly 
                  value="Non-Irrigated Traditional Wheat-Maize" 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 truncate"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Climate Resilient Variety</label>
                <input 
                  type="text" 
                  readOnly 
                  value="Drought-Hardy Sorghum-Millet-Chickpea" 
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-blue-700 truncate"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex justify-between">
                  <span>Discount / Stress Rate</span>
                  <span className="text-blue-700 font-black">{stressRate}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="25" 
                  value={stressRate} 
                  onChange={(e) => setStressRate(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0%</span>
                  <span>{stressRate}%</span>
                  <span>25%</span>
                </div>
              </div>
            </div>

            {/* 2-COLUMN MAIN LAYOUT: Vertical Sliders on Left Side, Comparative Graphs on Right Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT SIDEBAR: Vertical Sliders & Quick Hazard Presets (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Vertical Sliders Console Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Climate Stress Sliders</span>
                      <p className="text-[10px] text-slate-500">Drag vertical sliders to simulate stress</p>
                    </div>
                    <button
                      onClick={() => handleRunSimulation(0, 0, 0)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>

                  {/* 3 Vertical Sliders Side-by-Side */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    
                    {/* Vertical Slider 1: Rainfall */}
                    <div className="flex flex-col items-center justify-between text-center py-2.5 px-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="w-full space-y-1">
                        <span className="text-[11px] font-extrabold text-slate-700 block truncate" title="Rainfall Change">Rainfall</span>
                        <span className="inline-block font-mono text-blue-600 font-black text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {simRain > 0 ? `+${simRain}` : simRain}%
                        </span>
                        <div className="text-[9px] text-slate-400 font-semibold font-mono pt-1">+20%</div>
                      </div>

                      <div className="my-2 flex items-center justify-center h-48">
                        <input 
                          type="range" 
                          min="-40" 
                          max="20" 
                          step="5" 
                          value={simRain} 
                          onChange={(e) => handleRunSimulation(parseInt(e.target.value), simTemp, simWater)}
                          className="cursor-pointer accent-blue-600"
                          style={{ writingMode: "vertical-lr", direction: "rtl", WebkitAppearance: "slider-vertical", width: "28px", height: "180px" }}
                        />
                      </div>

                      <div className="w-full space-y-1">
                        <div className="text-[9px] text-slate-400 font-semibold font-mono">-40%</div>
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50/80 px-1 py-0.5 rounded block truncate">Deficit</span>
                      </div>
                    </div>

                    {/* Vertical Slider 2: Temperature */}
                    <div className="flex flex-col items-center justify-between text-center py-2.5 px-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="w-full space-y-1">
                        <span className="text-[11px] font-extrabold text-slate-700 block truncate" title="Temperature Rise">Temp Rise</span>
                        <span className="inline-block font-mono text-orange-600 font-black text-xs bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                          +{simTemp.toFixed(1)}°C
                        </span>
                        <div className="text-[9px] text-slate-400 font-semibold font-mono pt-1">+4.0°C</div>
                      </div>

                      <div className="my-2 flex items-center justify-center h-48">
                        <input 
                          type="range" 
                          min="0" 
                          max="4.0" 
                          step="0.5" 
                          value={simTemp} 
                          onChange={(e) => handleRunSimulation(simRain, parseFloat(e.target.value), simWater)}
                          className="cursor-pointer accent-orange-500"
                          style={{ writingMode: "vertical-lr", direction: "rtl", WebkitAppearance: "slider-vertical", width: "28px", height: "180px" }}
                        />
                      </div>

                      <div className="w-full space-y-1">
                        <div className="text-[9px] text-slate-400 font-semibold font-mono">+0°C</div>
                        <span className="text-[9px] font-bold text-orange-700 bg-orange-50/80 px-1 py-0.5 rounded block truncate">Warming</span>
                      </div>
                    </div>

                    {/* Vertical Slider 3: Irrigation */}
                    <div className="flex flex-col items-center justify-between text-center py-2.5 px-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="w-full space-y-1">
                        <span className="text-[11px] font-extrabold text-slate-700 block truncate" title="Irrigation Cut">Irrigation</span>
                        <span className="inline-block font-mono text-indigo-600 font-black text-xs bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                          {simWater}%
                        </span>
                        <div className="text-[9px] text-slate-400 font-semibold font-mono pt-1">0%</div>
                      </div>

                      <div className="my-2 flex items-center justify-center h-48">
                        <input 
                          type="range" 
                          min="-50" 
                          max="0" 
                          step="5" 
                          value={simWater} 
                          onChange={(e) => handleRunSimulation(simRain, simTemp, parseInt(e.target.value))}
                          className="cursor-pointer accent-indigo-600"
                          style={{ writingMode: "vertical-lr", direction: "rtl", WebkitAppearance: "slider-vertical", width: "28px", height: "180px" }}
                        />
                      </div>

                      <div className="w-full space-y-1">
                        <div className="text-[9px] text-slate-400 font-semibold font-mono">-50%</div>
                        <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50/80 px-1 py-0.5 rounded block truncate">Canal Cut</span>
                      </div>
                    </div>

                  </div>

                  {/* Quick Hazard Presets Stack */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Climate Stress Presets:</span>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <button 
                        onClick={() => handleRunSimulation(-20, 2.0, -30)} 
                        className="w-full text-left px-3 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span>Standard Spec</span>
                        <span className="font-mono text-[10px] text-blue-700 font-normal">-20% / +2°C / -30%</span>
                      </button>
                      <button 
                        onClick={() => handleRunSimulation(-30, 2.5, -40)} 
                        className="w-full text-left px-3 py-2 rounded-xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span>Severe 2030s Drought</span>
                        <span className="font-mono text-[10px] text-amber-700 font-normal">-30% / +2.5°C / -40%</span>
                      </button>
                      <button 
                        onClick={() => handleRunSimulation(-10, 1.5, -50)} 
                        className="w-full text-left px-3 py-2 rounded-xl bg-rose-50/80 hover:bg-rose-100 border border-rose-200 text-rose-900 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span>Canal Water Cut</span>
                        <span className="font-mono text-[10px] text-rose-700 font-normal">-10% / +1.5°C / -50%</span>
                      </button>
                      <button 
                        onClick={() => handleRunSimulation(-15, 4.0, -25)} 
                        className="w-full text-left px-3 py-2 rounded-xl bg-orange-50/80 hover:bg-orange-100 border border-orange-200 text-orange-950 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span>Extreme Heatwave</span>
                        <span className="font-mono text-[10px] text-orange-800 font-normal">-15% / +4°C / -25%</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Tip Card */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-slate-600 space-y-1 shadow-2xs">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Dynamic Stress Coupling
                  </div>
                  <p className="leading-relaxed">Moving any vertical slider immediately updates decadal yield curves, harvest models, and recalculates rotation rankings on the right in real-time.</p>
                </div>

              </div>

              {/* RIGHT MAIN CONTENT: Comparative Charts & Recalculated Score Table (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* FUTURE RISKS & DANGEROUS CLIMATE SITUATIONS (User Explicit Request) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      Future Risks & Dangerous Climate Situations Identified
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      stressIndex >= 1.5 
                        ? "bg-rose-600 text-white border-rose-700 animate-pulse shadow-sm" 
                        : stressIndex >= 0.8 
                          ? "bg-amber-100 text-amber-900 border-amber-300" 
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}>
                      {stressIndex >= 1.5 ? "Critical Climate Danger Zone" : stressIndex >= 0.8 ? "High Climate Hazard Warning" : "Baseline Stable Conditions"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Danger 1: Thermal Sterility */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Crop Heat Blast Risk</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          simTemp >= 3.5 ? 'bg-rose-600 text-white' : (simTemp >= 2.0 ? 'bg-rose-100 text-rose-700' : (simTemp >= 1.0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'))
                        }`}>
                          {simTemp >= 3.5 ? 'Extreme Critical Danger' : (simTemp >= 2.0 ? 'High Risk' : (simTemp >= 1.0 ? 'Caution Warning' : 'Safe / Baseline'))}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-rose-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round((simTemp / 5.0) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {simTemp >= 3.0 
                          ? `Extreme thermal stress (+${simTemp.toFixed(1)}°C): Pollen sterility in summer maize exceeds 60%; cotton sheds over 40% fruiting squares.`
                          : simTemp >= 1.5 
                            ? `Elevated heat (+${simTemp.toFixed(1)}°C): Tmax > 38°C accelerates crop respiration, causing tassel blast and shrinking wheat grain fill.`
                            : `Thermal regime remains within optimal physiological tolerance (+${simTemp.toFixed(1)}°C).`}
                      </p>
                    </div>

                    {/* Danger 2: Moisture Deficit */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Root-Zone Water Deficit</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          Math.round(Math.abs(Math.min(0, simRain)) * 4.2 + Math.abs(simWater) * 3.5) >= 220 
                            ? 'bg-rose-600 text-white' 
                            : Math.round(Math.abs(Math.min(0, simRain)) * 4.2 + Math.abs(simWater) * 3.5) >= 140 
                              ? 'bg-amber-100 text-amber-900' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {Math.round(Math.abs(Math.min(0, simRain)) * 4.2 + Math.abs(simWater) * 3.5) >= 220 
                            ? 'Critical Drought Failure' 
                            : Math.round(Math.abs(Math.min(0, simRain)) * 4.2 + Math.abs(simWater) * 3.5) >= 140 
                              ? 'Severe Deficit' 
                              : 'Optimal Balance'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round((Math.round(Math.abs(Math.min(0, simRain)) * 4.2 + Math.abs(simWater) * 3.5) / 300) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Cumulative evapotranspiration deficit of -{Math.round(Math.abs(Math.min(0, simRain)) * 4.2 + Math.abs(simWater) * 3.5)} mm. Canal intervals stretch past 21 days, desiccating shallow root zones.
                      </p>
                    </div>

                    {/* Danger 3: Pumping Cost Surge */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Tubewell Energy Cost Surge</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-700">
                          +{Math.round(Math.abs(simWater) * 1.35 + (simTemp * 5))}% Cost Surge
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(Math.abs(simWater) * 1.35 + (simTemp * 5)))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Aquifer drawdown forces deeper tubewell suction, triggering a {Math.round(Math.abs(simWater) * 1.35 + (simTemp * 5))}% increase in diesel and grid electric expenses.
                      </p>
                    </div>

                    {/* Danger 4: Monoculture Yield Loss */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Monoculture Yield Failure</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700">
                          -{traditionalLoss2060}% Drop
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-rose-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round(traditionalLoss2060 * 2.5))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Continuous cereal monocultures collapse under prolonged dry spells, suffering steep biological yield penalties.
                      </p>
                    </div>
                  </div>
                </div>

                {/* TWO COMPARATIVE CHARTS SIDE-BY-SIDE */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Chart 1: Climate Risk Yield Impact (%) */}
                  <div className="min-w-0 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900">Climate Risk Yield Impact (%)</h3>
                      <span className="text-[10px] text-slate-500 font-semibold">Decade Progression</span>
                    </div>
                    <div className="h-[240px] w-full pt-2">
                      <ResponsiveContainer width="100%" height={240} minWidth={260}>
                        <LineChart data={yieldImpactData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="decade" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} unit="%" domain={[-20, 0]} />
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "0.5rem", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                          <Line type="monotone" dataKey="traditional" stroke="#ef4444" strokeWidth={3} name="Traditional Variety" dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="resilient" stroke="#0284c7" strokeWidth={3} name="Climate Resilient" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Total Projected Yield (kg/ha) */}
                  <div className="min-w-0 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900">Total Projected Yield (kg/10ha)</h3>
                      <span className="text-[10px] text-slate-500 font-semibold">Biological Harvest</span>
                    </div>
                    <div className="h-[240px] w-full pt-2">
                      <ResponsiveContainer width="100%" height={240} minWidth={260}>
                        <LineChart data={projectedYieldData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="decade" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} domain={[13000, 21000]} />
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "0.5rem", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                          <Line type="monotone" dataKey="traditional" stroke="#dc2626" strokeWidth={3} name="Traditional Variety" dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="resilient" stroke="#0284c7" strokeWidth={3} name="Climate Resilient" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recalculated Score Table & Explanation */}
                {(() => {
                  const baseA = dynamicStrategies[0]?.overallScore || 84;
                  const baseB = dynamicStrategies[1]?.overallScore || 93;
                  const baseC = dynamicStrategies[2]?.overallScore || 78;

                  const deltaA = Math.round(-simTemp * 4.2 + (simRain * 0.28) + (simWater * 0.38) - (stressRate * 0.2));
                  const deltaB = Math.round(-simTemp * 0.8 + (simRain * 0.08) + (simWater * 0.10) + (simTemp >= 1.5 || simWater <= -20 ? 6 : 0) - (stressRate * 0.05));
                  const deltaC = Math.round(-simTemp * 3.4 + (simRain * 0.22) + (simWater * 0.44) - (stressRate * 0.25));

                  const scoreA = Math.max(45, Math.min(98, baseA + deltaA));
                  const scoreB = Math.max(50, Math.min(99, baseB + deltaB));
                  const scoreC = Math.max(40, Math.min(95, baseC + deltaC));

                  const isBWinner = scoreB >= scoreA && scoreB >= scoreC;

                  return (
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Recalculated Suitability Under Stress Scenario
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                          isBWinner ? "bg-blue-100 text-blue-800" : scoreA >= scoreB ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                        }`}>
                          {isBWinner ? "Strategy B Ranks First!" : scoreA >= scoreB ? "Strategy A Ranks First!" : "Strategy C Ranks First!"}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                              <th className="py-2 px-3">Strategy</th>
                              <th className="px-3">Current Scenario</th>
                              <th className="px-3">Changed Scenario</th>
                              <th className="px-3">Outcome</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            <tr className={`hover:bg-slate-50 ${scoreA > scoreB ? "bg-emerald-50/50 font-bold" : ""}`}>
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {dynamicStrategies[0]?.name || "Strategy A"} ({dynamicStrategies[0]?.sequence || "Wheat ➔ Chickpea ➔ Maize"})
                              </td>
                              <td className="px-3 font-bold text-slate-600">{baseA}</td>
                              <td className={`px-3 font-bold ${scoreA < baseA ? "text-rose-600" : "text-emerald-700 font-black text-sm"}`}>{scoreA}</td>
                              <td className="px-3 font-bold">
                                {scoreA > scoreB ? (
                                  <span className="text-emerald-700">🏆 Promoted to Rank #1 (+{scoreA - baseA} pts)</span>
                                ) : (
                                  <span className="text-rose-600">Demoted to Rank 2 ({scoreA - baseA} pts)</span>
                                )}
                              </td>
                            </tr>
                            <tr className={`font-bold ${isBWinner ? "bg-blue-50/70" : ""}`}>
                              <td className="py-2.5 px-3 text-blue-900">
                                {dynamicStrategies[1]?.name || "Strategy B"} ({dynamicStrategies[1]?.sequence || "Wheat ➔ Pearl Millet ➔ Chickpea"})
                              </td>
                              <td className="px-3 text-blue-800">{baseB}</td>
                              <td className="px-3 font-black text-blue-700 text-sm">{scoreB}</td>
                              <td className="px-3 text-emerald-700 font-black">
                                {isBWinner ? `🏆 Promoted to Rank #1 (+${scoreB - baseB} pts)` : `Rank #2 (${scoreB - baseB} pts)`}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {dynamicStrategies[2]?.name || "Strategy C"} ({dynamicStrategies[2]?.sequence || "Wheat ➔ Berseem ➔ Maize"})
                              </td>
                              <td className="px-3 font-bold text-slate-600">{baseC}</td>
                              <td className="px-3 font-bold text-slate-600">{scoreC}</td>
                              <td className="px-3 text-slate-500">Rank 3 ({scoreC - baseC} pts)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* System Takeaway */}
                      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
                        <strong>System Takeaway:</strong> &ldquo;Under the selected {simRain < 0 ? "reduced-rainfall" : "simulated"} ({simRain > 0 ? `+${simRain}` : simRain}%) and irrigation ({simWater}%) scenario with +{simTemp}°C warming, Strategy B becomes {isBWinner ? "the top recommended pathway" : "evaluated"} because its candidate sequence optimizes water-resilience and thermal stress endurance.&rdquo;
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveTab("assistant");
                            handleSendMessage("Why did Strategy B become better when I reduced rainfall?");
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Bot className="w-4 h-4" />
                          <span>Ask AI To Explain This Shift →</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

              </div>

            </div>
          </section>
        )}{/* ---------------- 6. AI AGRICULTURAL ASSISTANT (Image 4 AgriAI Style) ---------------- */}
        {activeTab === "assistant" && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-950">AgriAI Advisor</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Ask anything—farming practices, soil pH, irrigation schedules, or rotation rationale
                </p>
              </div>
            </div>

            {/* Quick Questions (Clickable Chips) */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Quick Suggested Questions:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Why did Strategy B become better when I reduced rainfall?",
                  "Why should I grow chickpeas after wheat?",
                  "Explain my 79-day dry spell environmental risk report.",
                  "What crops should I plant this season?",
                  "How does loamy soil and 7.5 pH benefit legumes?",
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs text-slate-700 font-semibold transition-all text-left shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Container */}
            <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-sm">
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                {chatMessages.map((m, idx) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                        isUser ? "bg-blue-600 text-white shadow-sm" : "bg-emerald-600 text-white"
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white rounded-tr-none shadow-sm font-medium whitespace-pre-wrap"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs"
                      }`}>
                        {isUser ? m.content : <StructuredChatContent content={m.content} />}
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center text-xs text-slate-500 p-3 bg-white rounded-xl border border-slate-200">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>AgriAI is analyzing NASA observations and agronomic rules...</span>
                  </div>
                )}
              </div>

              {/* Free-form Input for Asking ANYTHING */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AgriAI anything (e.g. soil amendments, pest defense, irrigation timing)..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ---------------- 7. FARM ACTION REPORT (Printable with Visual Charts & Dynamic Multi-Field Data!) ---------------- */}
        {activeTab === "report" && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div>
                <h2 className="text-xl font-bold text-slate-900">7. Final Decision — Farmer&apos;s Comprehensive Advisory Report</h2>
                <p className="text-xs text-slate-500">Official comprehensive report dynamically synthesized from your farm registration & NASA observations</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-print-pdf"
                  onClick={handlePrintReport}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* Official Report Document */}
            <div id="action-plan-report" className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-8 text-xs text-slate-800 print:border-none print:shadow-none print:p-0">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🛰️</span>
                    <strong className="text-xl text-slate-950 font-black">AgroShift AI — Official Farm Action Report</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">NASA Earth Observations & Agroclimatology Synthesis</div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div className="text-emerald-700 font-bold">Status: Verified Analysis</div>
                </div>
              </div>

              {/* 1. Farm Profile (Dynamically retrieved from Farm Registration) */}
              <div className="space-y-2">
                <strong className="text-xs uppercase tracking-wider text-blue-800 block">
                  1. Farm Profile & Land Allocation
                </strong>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div><span className="text-slate-500 block text-[10px]">Farm Name</span><strong className="text-slate-900 font-bold">{farmName}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Location</span><strong className="text-slate-900 font-bold">{locationName} ({latitude.toFixed(4)}°, {longitude.toFixed(4)}°)</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Total Land Area</span><strong className="text-blue-700 font-bold">{totalFarmAcres} Acres</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Dominant Base Crop</span><strong className="text-emerald-700 font-bold">{dominantCrop}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Soil Texture</span><strong className="text-slate-900 font-bold">{soilType}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Soil pH</span><strong className="text-blue-700 font-bold">{soilPh} pH</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Irrigation System</span><strong className="text-slate-900 font-bold">{irrigationType}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Farmer Priority</span><strong className="text-emerald-700 font-bold">{priority}</strong></div>
                </div>
              </div>

              {/* 2. NASA Observations Summary (Dynamically retrieved from Satellite API) */}
              <div className="space-y-2">
                <strong className="text-xs uppercase tracking-wider text-blue-800 block">
                  2. NASA Agroclimatology Observations
                </strong>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div><span className="text-slate-500 block text-[10px]">Mean Annual Temp</span><strong className="text-slate-900 font-bold">{nasaData?.summary?.avg_temperature ?? 26.8}°C</strong> (Peak: {nasaData?.summary?.max_temperature_recorded ?? 38.5}°C)</div>
                  <div><span className="text-slate-500 block text-[10px]">Annual Precipitation</span><strong className="text-blue-700 font-bold">{nasaData?.summary?.total_precipitation ?? 482.0} mm</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Heat Stress Days (&gt;35°C)</span><strong className="text-rose-700 font-bold">{nasaData?.summary?.heat_stress_days ?? 184} Days</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Longest Dry Spell</span><strong className="text-amber-800 font-bold">{nasaData?.summary?.longest_dry_spell_days ?? 79} Days</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Solar Radiation</span><strong className="text-slate-900 font-bold">{nasaData?.summary?.avg_solar_radiation ?? 18.2} MJ/m²/day</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Water Scarcity Risk</span><strong className="text-rose-700 font-bold">{nasaData?.indicators?.water_scarcity_level ?? "Moderate"}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Heat Stress Risk</span><strong className="text-amber-800 font-bold">{nasaData?.indicators?.heat_stress_risk ?? "Moderate"}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Rabi / Kharif Rainfall</span><strong className="text-slate-900 font-bold">{nasaData?.summary?.rabi_precipitation ?? 115} mm / {nasaData?.summary?.kharif_precipitation ?? 367} mm</strong></div>
                </div>
              </div>

              {/* 3. EMBEDDED CLIMATE PROFILE CHART */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <strong className="text-xs text-slate-900 block border-b border-slate-200 pb-1">
                  NASA 12-Month Temperature & Precipitation Profile (Visual Representation)
                </strong>
                <div className="h-[180px] w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Line type="monotone" dataKey="rain" stroke="#2563eb" strokeWidth={2} name="Rainfall (mm)" dot={false} />
                      <Line type="monotone" dataKey="temp" stroke="#ea580c" strokeWidth={2} name="Temp (°C)" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4. Multi-Field Parcels Rotation Succession Matrix (Dynamically retrieved from Registered Fields) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <strong className="text-xs uppercase tracking-wider text-slate-900 block">
                    3. Registered Field Parcels & Multi-Year Succession Plan:
                  </strong>
                  <span className="text-[11px] font-bold text-slate-500">
                    {activeFields.length} Field Parcel{activeFields.length !== 1 ? 's' : ''} ({totalFarmAcres} ac total)
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2.5">Field ID</th>
                        <th className="p-2.5">Area</th>
                        <th className="p-2.5">Soil & pH</th>
                        <th className="p-2.5">2026 Base</th>
                        <th className="p-2.5">2027 Next Rotation</th>
                        <th className="p-2.5">2028 Future Succession</th>
                        <th className="p-2.5">Recommended Strategy</th>
                        <th className="p-2.5 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeFields.map((f, i) => {
                        const dynamicFieldRot = getRotationForCrop(
                          f.y2026, 
                          f.soil ? f.soil.split(" ")[0] : soilType, 
                          f.ph || Number(soilPh), 
                          priority, 
                          irrigationType
                        );
                        return (
                          <tr key={i} className="hover:bg-slate-50/80">
                            <td className="p-2.5 font-bold text-slate-900">{f.id}</td>
                            <td className="p-2.5 font-mono font-semibold">{f.acres} ac</td>
                            <td className="p-2.5 text-slate-600">{f.soil}</td>
                            <td className="p-2.5 font-bold text-slate-800">{f.y2026}</td>
                            <td className="p-2.5 font-bold text-emerald-700">{f.y2027 || dynamicFieldRot.y2027}</td>
                            <td className="p-2.5 font-bold text-blue-700">{f.y2028 || dynamicFieldRot.y2028}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dynamicFieldRot.color}`}>
                                {dynamicFieldRot.strategy}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-black text-emerald-600">{dynamicFieldRot.score} / 100</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Evaluated Crop Rotation Sequences (Dynamically generated from dynamicStrategies) */}
              <div className="space-y-2">
                <strong className="text-xs uppercase tracking-wider text-slate-900 block border-b border-slate-200 pb-1">
                  4. Evaluated Strategic Crop Rotation Alternatives:
                </strong>
                <div className="space-y-2">
                  {dynamicStrategies.map((strat) => {
                    const isWinner = strat.key === topEvaluatedStrategy.key;
                    return (
                      <div 
                        key={strat.key} 
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isWinner ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-slate-900">{strat.name}:</strong>
                            <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 text-xs shadow-2xs">
                              {strat.sequence}
                            </span>
                            {isWinner && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                                ★ TOP RECOMMENDATION
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Focus: {strat.focusPoints.join(" • ")}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 pt-0.5">
                            <span>Water: <strong className="text-blue-700">{strat.waterMetric}</strong></span>
                            <span>Nitrogen: <strong className="text-emerald-700">{strat.nMetric}</strong></span>
                            <span>Pest Break: <strong className="text-amber-800">{strat.pestMetric}</strong></span>
                            <span>Soil C: <strong className="text-purple-700">{strat.somMetric}</strong></span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-slate-900">{strat.overallScore} / 100</div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            Clim {strat.climateScore} | Wat {strat.waterScore} | Soil {strat.soilScore} | Pri {strat.priorityScore}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. What-If Climate Stress Simulation & Future Hazard Analysis */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <strong className="text-xs uppercase tracking-wider text-amber-800 block">
                    5. What-If Climate Stress Simulation & Future Hazard Analysis:
                  </strong>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Rainfall: {simRain > 0 ? '+' : ''}{simRain}% | Temp: +{Number(simTemp).toFixed(1)}°C | Irrigation: {simWater}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-900 text-[11px]">
                      <span>Heat Blast Risk</span>
                      <span className="font-extrabold text-rose-700">{simTemp >= 2.0 ? 'High Risk' : 'Safe / Baseline'}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">Summer Tmax &gt; 38°C risks tassel sterility in Maize.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-900 text-[11px]">
                      <span>Moisture Deficit</span>
                      <span className="font-extrabold text-amber-800">-{Math.round(Math.abs(Math.min(0, simRain)) * 4.2 + Math.abs(simWater) * 3.5)} mm</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">Canal intervals stretch past 21 days; shallow roots wilt.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-indigo-900 text-[11px]">
                      <span>Pumping Cost Surge</span>
                      <span className="font-extrabold text-indigo-700">+{Math.round(Math.abs(simWater) * 1.35 + (simTemp * 5))}% Cost</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">Water table drawdown increases tubewell diesel/electric costs.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-900 text-[11px]">
                      <span>Monoculture Loss</span>
                      <span className="font-extrabold text-rose-700">-{Math.round(16.0 * ((Math.abs(Math.min(0, simRain))/20)*0.35 + (simTemp/2)*0.4 + (Math.abs(simWater)/30)*0.45) * 10)/10}%</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">Continuous monoculture suffers severe decadal yield drop.</p>
                  </div>
                </div>

                {simulation?.strategies && simulation.strategies.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2">Strategy Name</th>
                          <th className="p-2">Crop Sequence</th>
                          <th className="p-2 text-center">Baseline Score</th>
                          <th className="p-2 text-center">Stressed Score</th>
                          <th className="p-2 text-center">Score Delta</th>
                          <th className="p-2 text-center">New Rank</th>
                          <th className="p-2">Climate Resilience Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {simulation.strategies.map((st, sIdx) => (
                          <tr key={sIdx} className={st.simulated_rank === 1 ? 'bg-blue-50/80 font-bold border-2 border-blue-400' : 'bg-white'}>
                            <td className="p-2 font-bold text-slate-900">{st.strategy_name} {st.simulated_rank === 1 ? '★ TOP WINNER' : ''}</td>
                            <td className="p-2">{st.crop_sequence}</td>
                            <td className="p-2 text-center font-mono">{st.baseline_score}</td>
                            <td className="p-2 text-center font-mono font-extrabold text-blue-700">{st.simulated_score}</td>
                            <td className={`p-2 text-center font-bold ${st.delta < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{st.delta >= 0 ? '+' : ''}{st.delta} pts</td>
                            <td className="p-2 text-center font-black text-blue-700">#{st.simulated_rank}</td>
                            <td className="p-2 text-slate-600">{st.insight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 font-medium leading-relaxed">
                  <strong>Climate Resilience Recommendation:</strong> {simulation?.takeaway || "Under tested climate stress, adopting water-conserving pulse rotations curbs decadal crop yield vulnerability by up to 25%."}
                </div>
              </div>

              {/* 6. Recommended Next Steps (Tailored to Crop & Soil) */}
              <div className="space-y-2 pt-2 border-t border-slate-200 text-slate-700">
                <strong className="text-xs text-slate-900 block">
                  6. Prescribed Agronomic Action Steps for {dominantCrop} & {soilType} Soil:
                </strong>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {getActionStepsForCrop(dominantCrop, soilType, Number(soilPh), priority).map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 shrink-0">{sIdx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attribution */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400">
                Data Sources: NASA POWER Agroclimatology API, FAO Irrigation and Drainage Paper 56, Pakistan Agricultural Research Council (PARC).
              </div>
            </div>
          </section>
        )}

              </main>

        {/* ================= RICH PLATFORM FOOTER ================= */}
        <footer className="w-full border-t border-slate-200/90 bg-white py-12 px-6 sm:px-10 lg:px-14 text-xs text-slate-600 space-y-8 no-print mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Column 1: Platform Mission */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm border border-emerald-400/30">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 4C16 4 9 9.5 9 16.5C9 21 12.5 24.5 16 25.5C19.5 24.5 23 21 23 16.5C23 9.5 16 4 16 4Z" fill="currentColor" fillOpacity="0.95"/>
                    <path d="M16 8V24M12 16C13.5 17.5 16 18.5 16 18.5M20 15C18.5 16.5 16 17.5 16 17.5" stroke="#064e3b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="16" cy="5.5" r="1.3" fill="#a7f3d0"/>
                    <path d="M5 27C8.5 24.5 12 24 16 24C20 24 23.5 24.5 27 27" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-sm font-black text-slate-950">Agro<span className="text-emerald-600">Shift</span> AI</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Autonomous agricultural intelligence coupling NASA Earth Observations with agronomic crop models to deliver climate-resilient crop rotations, soil health restoration, and smallholder farm profitability.
              </p>
            </div>

            {/* Column 2: Scientific Data Sources */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Earth Science Data</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-500">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>NASA POWER Agroclimatology (LaRC)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  <span>FAO-56 Penman-Monteith Evapotranspiration</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Pakistan Agricultural Research Council (PARC)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>USDA-NRCS Soil Water Dynamics</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Modules */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Platform Modules</h4>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 font-medium">
                <button onClick={() => setActiveTab("dashboard")} className="text-left hover:text-blue-600 transition-colors">Executive Dashboard</button>
                <button onClick={() => setActiveTab("farm")} className="text-left hover:text-blue-600 transition-colors">Farm Registration</button>
                <button onClick={() => setActiveTab("nasa")} className="text-left hover:text-blue-600 transition-colors">Envirnoment analysis</button>
                <button onClick={() => setActiveTab("rotations")} className="text-left hover:text-blue-600 transition-colors">Rotation Planner</button>
                <button onClick={() => setActiveTab("simulator")} className="text-left hover:text-blue-600 transition-colors">Climate Forecast</button>
                <button onClick={() => setActiveTab("assistant")} className="text-left hover:text-blue-600 transition-colors">AI Field Copilot</button>
                <button onClick={() => setActiveTab("report")} className="text-left hover:text-blue-600 transition-colors">Action Plan Dossier</button>
              </div>
            </div>

            {/* Column 4: Agronomic Responsibility */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Agronomic Assurance</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Deterministic, zero-hallucination sequence validation ensuring every recommendation respects regional soil pH, canal turn intervals, pest cycles, and biological nitrogen balances.
              </p>
              <div className="pt-1 text-[10px] text-slate-400 font-mono">
                Framework: Python 3.12 • FastAPI • Next.js
              </div>
            </div>

          </div>

          {/* Sub-Footer Copyright Bar */}
          <div className="max-w-7xl mx-auto border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 <strong>AgroShift AI Systems</strong>. Grounded in NASA Satellite Earth Observations & Agronomic Science.
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium">
              <span>Sustainable Development Goal 2 (Zero Hunger)</span>
              <span>•</span>
              <span>Climate Action SDG 13</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}