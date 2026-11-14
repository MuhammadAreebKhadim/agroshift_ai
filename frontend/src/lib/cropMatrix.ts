// 13-Crop Comprehensive Agronomic Knowledge Matrix (FAO, PARC, NARC)
export interface CropData {
  id: string;
  name: string;
  scientific_name: string;
  season: string;
  type: string;
  water_demand_mm: number;
  temp_opt_min: number;
  temp_opt_max: number;
  temp_limit_max: number;
  frost_sensitive: boolean;
  soil_textures: string[];
  soil_ph_min: number;
  soil_ph_max: number;
  soil_ph_opt: number;
  nitrogen_fixation_kg_ha: number;
  nutrient_demand: string;
  root_depth: string;
  drought_tolerance: string;
  heat_tolerance: string;
  economic_value: string;
  agronomic_benefits: string;
  preceding_crops: string[];
  succeeding_crops: string[];
}

export const CROP_DATABASE: Record<string, CropData> = {
  "Wheat": {
    "id": "wheat",
    "name": "Wheat",
    "scientific_name": "Triticum aestivum",
    "season": "Rabi",
    "type": "Cereal",
    "water_demand_mm": 400,
    "temp_opt_min": 15.0,
    "temp_opt_max": 25.0,
    "temp_limit_max": 32.0,
    "frost_sensitive": false,
    "soil_textures": [
      "Loamy",
      "Clay-Loam",
      "Sandy-Loam",
      "Clay"
    ],
    "soil_ph_min": 6.0,
    "soil_ph_max": 8.0,
    "soil_ph_opt": 7.0,
    "nitrogen_fixation_kg_ha": 0,
    "nutrient_demand": "High",
    "root_depth": "Medium",
    "drought_tolerance": "Medium",
    "heat_tolerance": "Medium",
    "economic_value": "High",
    "agronomic_benefits": "Staple food grain security, high stubble/straw value for livestock feed, reliable market liquidity.",
    "preceding_crops": [
      "Chickpea",
      "Lentils",
      "Berseem",
      "Mung Bean",
      "Soybean",
      "Maize"
    ],
    "succeeding_crops": [
      "Maize",
      "Sorghum",
      "Mung Bean",
      "Cotton",
      "Soybean",
      "Pearl Millet"
    ]
  },
  "Chickpea": {
    "id": "chickpea",
    "name": "Chickpea (Gram)",
    "scientific_name": "Cicer arietinum",
    "season": "Rabi",
    "type": "Pulse/Legume",
    "water_demand_mm": 250,
    "temp_opt_min": 16.0,
    "temp_opt_max": 26.0,
    "temp_limit_max": 34.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Sandy-Loam",
      "Loamy",
      "Clay-Loam"
    ],
    "soil_ph_min": 6.0,
    "soil_ph_max": 8.2,
    "soil_ph_opt": 7.2,
    "nitrogen_fixation_kg_ha": 65,
    "nutrient_demand": "Low",
    "root_depth": "Deep",
    "drought_tolerance": "High",
    "heat_tolerance": "Medium",
    "economic_value": "High",
    "agronomic_benefits": "Fixes 40-70 kg N/ha, deep taproot breaks subsoil plow pan, highly drought hardy, breaks cereal root disease cycles.",
    "preceding_crops": [
      "Wheat",
      "Sorghum",
      "Pearl Millet",
      "Maize"
    ],
    "succeeding_crops": [
      "Maize",
      "Sorghum",
      "Cotton",
      "Pearl Millet"
    ]
  },
  "Lentils": {
    "id": "lentils",
    "name": "Lentils (Masoor)",
    "scientific_name": "Lens culinaris",
    "season": "Rabi",
    "type": "Pulse/Legume",
    "water_demand_mm": 220,
    "temp_opt_min": 14.0,
    "temp_opt_max": 24.0,
    "temp_limit_max": 30.0,
    "frost_sensitive": false,
    "soil_textures": [
      "Loamy",
      "Clay-Loam",
      "Sandy-Loam"
    ],
    "soil_ph_min": 6.0,
    "soil_ph_max": 7.8,
    "soil_ph_opt": 6.8,
    "nitrogen_fixation_kg_ha": 50,
    "nutrient_demand": "Low",
    "root_depth": "Medium",
    "drought_tolerance": "Medium",
    "heat_tolerance": "Low",
    "economic_value": "High",
    "agronomic_benefits": "Short growing season (100-110 days), fixes 35-55 kg N/ha, enriches soil organic matter, excellent cash pulse.",
    "preceding_crops": [
      "Wheat",
      "Maize",
      "Rice",
      "Cotton"
    ],
    "succeeding_crops": [
      "Maize",
      "Sorghum",
      "Mung Bean",
      "Cotton"
    ]
  },
  "Maize": {
    "id": "maize",
    "name": "Maize (Corn)",
    "scientific_name": "Zea mays",
    "season": "Kharif",
    "type": "Cereal",
    "water_demand_mm": 550,
    "temp_opt_min": 20.0,
    "temp_opt_max": 32.0,
    "temp_limit_max": 36.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Loamy",
      "Clay-Loam",
      "Sandy-Loam"
    ],
    "soil_ph_min": 5.8,
    "soil_ph_max": 7.5,
    "soil_ph_opt": 6.8,
    "nitrogen_fixation_kg_ha": 0,
    "nutrient_demand": "High",
    "root_depth": "Medium",
    "drought_tolerance": "Low",
    "heat_tolerance": "Medium",
    "economic_value": "High",
    "agronomic_benefits": "High yield potential and commercial revenue; heavy residue returns carbon to soil if mulched.",
    "preceding_crops": [
      "Chickpea",
      "Berseem",
      "Lentils",
      "Soybean",
      "Mustard"
    ],
    "succeeding_crops": [
      "Wheat",
      "Chickpea",
      "Berseem",
      "Mustard"
    ]
  },
  "Sorghum": {
    "id": "sorghum",
    "name": "Sorghum (Jowar)",
    "scientific_name": "Sorghum bicolor",
    "season": "Kharif",
    "type": "Cereal/Fodder",
    "water_demand_mm": 380,
    "temp_opt_min": 24.0,
    "temp_opt_max": 36.0,
    "temp_limit_max": 42.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Loamy",
      "Clay-Loam",
      "Sandy-Loam",
      "Clay",
      "Sandy"
    ],
    "soil_ph_min": 5.5,
    "soil_ph_max": 8.5,
    "soil_ph_opt": 7.2,
    "nitrogen_fixation_kg_ha": 0,
    "nutrient_demand": "Medium",
    "root_depth": "Deep",
    "drought_tolerance": "Very High",
    "heat_tolerance": "Very High",
    "economic_value": "Medium",
    "agronomic_benefits": "Exceptional heat & moisture stress resilience; deep extensive root system recycles subsoil nutrients and extracts deep water.",
    "preceding_crops": [
      "Wheat",
      "Chickpea",
      "Berseem",
      "Mustard"
    ],
    "succeeding_crops": [
      "Wheat",
      "Chickpea",
      "Lentils",
      "Mustard"
    ]
  },
  "Berseem": {
    "id": "berseem",
    "name": "Berseem (Egyptian Clover)",
    "scientific_name": "Trifolium alexandrinum",
    "season": "Rabi",
    "type": "Legume Fodder",
    "water_demand_mm": 500,
    "temp_opt_min": 15.0,
    "temp_opt_max": 25.0,
    "temp_limit_max": 32.0,
    "frost_sensitive": false,
    "soil_textures": [
      "Loamy",
      "Clay-Loam",
      "Clay"
    ],
    "soil_ph_min": 6.5,
    "soil_ph_max": 8.5,
    "soil_ph_opt": 7.4,
    "nitrogen_fixation_kg_ha": 110,
    "nutrient_demand": "Low",
    "root_depth": "Medium",
    "drought_tolerance": "Low",
    "heat_tolerance": "Low",
    "economic_value": "High",
    "agronomic_benefits": "King of fodders. Fixes 100-140 kg N/ha, 4-6 cuttings provide constant farm cash flow, suppresses weeds, rebuilds soil microbiology.",
    "preceding_crops": [
      "Maize",
      "Sorghum",
      "Rice",
      "Cotton",
      "Pearl Millet"
    ],
    "succeeding_crops": [
      "Maize",
      "Cotton",
      "Rice",
      "Sorghum"
    ]
  },
  "Cotton": {
    "id": "cotton",
    "name": "Cotton",
    "scientific_name": "Gossypium hirsutum",
    "season": "Kharif",
    "type": "Cash Crop",
    "water_demand_mm": 650,
    "temp_opt_min": 25.0,
    "temp_opt_max": 35.0,
    "temp_limit_max": 42.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Loamy",
      "Clay-Loam",
      "Clay"
    ],
    "soil_ph_min": 6.0,
    "soil_ph_max": 8.5,
    "soil_ph_opt": 7.5,
    "nitrogen_fixation_kg_ha": 0,
    "nutrient_demand": "High",
    "root_depth": "Deep",
    "drought_tolerance": "Medium",
    "heat_tolerance": "High",
    "economic_value": "High",
    "agronomic_benefits": "Major industrial cash revenue, deep taproot loosens hardpan, responds strongly to preceding legume nitrogen residual.",
    "preceding_crops": [
      "Berseem",
      "Chickpea",
      "Lentils",
      "Wheat",
      "Mustard"
    ],
    "succeeding_crops": [
      "Wheat",
      "Chickpea",
      "Berseem",
      "Mustard"
    ]
  },
  "Rice": {
    "id": "rice",
    "name": "Rice (Basmati)",
    "scientific_name": "Oryza sativa",
    "season": "Kharif",
    "type": "Cereal",
    "water_demand_mm": 1100,
    "temp_opt_min": 22.0,
    "temp_opt_max": 33.0,
    "temp_limit_max": 38.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Clay",
      "Clay-Loam",
      "Loamy"
    ],
    "soil_ph_min": 5.5,
    "soil_ph_max": 7.5,
    "soil_ph_opt": 6.5,
    "nitrogen_fixation_kg_ha": 0,
    "nutrient_demand": "High",
    "root_depth": "Shallow",
    "drought_tolerance": "Low",
    "heat_tolerance": "Medium",
    "economic_value": "High",
    "agronomic_benefits": "High export economic value, reclaims slightly saline soils through continuous leaching.",
    "preceding_crops": [
      "Wheat",
      "Berseem",
      "Lentils",
      "Chickpea"
    ],
    "succeeding_crops": [
      "Wheat",
      "Berseem",
      "Lentils",
      "Mustard"
    ]
  },
  "Soybean": {
    "id": "soybean",
    "name": "Soybean",
    "scientific_name": "Glycine max",
    "season": "Kharif",
    "type": "Pulse/Legume",
    "water_demand_mm": 450,
    "temp_opt_min": 20.0,
    "temp_opt_max": 30.0,
    "temp_limit_max": 35.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Loamy",
      "Clay-Loam",
      "Sandy-Loam"
    ],
    "soil_ph_min": 6.0,
    "soil_ph_max": 7.5,
    "soil_ph_opt": 6.6,
    "nitrogen_fixation_kg_ha": 85,
    "nutrient_demand": "Medium",
    "root_depth": "Medium",
    "drought_tolerance": "Medium",
    "heat_tolerance": "Medium",
    "economic_value": "High",
    "agronomic_benefits": "High protein oilseed value, fixes 70-100 kg N/ha, reduces chemical fertilizer costs for succeeding wheat.",
    "preceding_crops": [
      "Wheat",
      "Mustard",
      "Barley"
    ],
    "succeeding_crops": [
      "Wheat",
      "Chickpea",
      "Mustard"
    ]
  },
  "Mustard": {
    "id": "mustard",
    "name": "Mustard / Canola (Raya)",
    "scientific_name": "Brassica juncea",
    "season": "Rabi",
    "type": "Oilseed",
    "water_demand_mm": 280,
    "temp_opt_min": 12.0,
    "temp_opt_max": 24.0,
    "temp_limit_max": 30.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Sandy-Loam",
      "Loamy",
      "Clay-Loam"
    ],
    "soil_ph_min": 6.0,
    "soil_ph_max": 8.0,
    "soil_ph_opt": 7.0,
    "nitrogen_fixation_kg_ha": 0,
    "nutrient_demand": "Medium",
    "root_depth": "Deep",
    "drought_tolerance": "High",
    "heat_tolerance": "Low",
    "economic_value": "High",
    "agronomic_benefits": "Short duration, glucosinolate root exudates naturally biofumigate soil pests and pathogens.",
    "preceding_crops": [
      "Maize",
      "Sorghum",
      "Cotton",
      "Pearl Millet"
    ],
    "succeeding_crops": [
      "Maize",
      "Cotton",
      "Mung Bean",
      "Sorghum"
    ]
  },
  "Mung Bean": {
    "id": "mung_bean",
    "name": "Mung Bean (Green Gram)",
    "scientific_name": "Vigna radiata",
    "season": "Zaid/Summer",
    "type": "Pulse/Legume",
    "water_demand_mm": 200,
    "temp_opt_min": 25.0,
    "temp_opt_max": 35.0,
    "temp_limit_max": 40.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Sandy-Loam",
      "Loamy"
    ],
    "soil_ph_min": 6.2,
    "soil_ph_max": 7.8,
    "soil_ph_opt": 7.0,
    "nitrogen_fixation_kg_ha": 45,
    "nutrient_demand": "Low",
    "root_depth": "Shallow",
    "drought_tolerance": "High",
    "heat_tolerance": "High",
    "economic_value": "High",
    "agronomic_benefits": "Rapid maturity (65 days) fits perfectly into fallow windows, fixes nitrogen, produces green mulch.",
    "preceding_crops": [
      "Wheat",
      "Mustard",
      "Chickpea"
    ],
    "succeeding_crops": [
      "Wheat",
      "Maize",
      "Sorghum",
      "Rice"
    ]
  },
  "Pearl Millet": {
    "id": "pearl_millet",
    "name": "Pearl Millet (Bajra)",
    "scientific_name": "Pennisetum glaucum",
    "season": "Kharif",
    "type": "Cereal/Fodder",
    "water_demand_mm": 280,
    "temp_opt_min": 26.0,
    "temp_opt_max": 38.0,
    "temp_limit_max": 44.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Sandy",
      "Sandy-Loam",
      "Loamy"
    ],
    "soil_ph_min": 5.5,
    "soil_ph_max": 8.5,
    "soil_ph_opt": 7.0,
    "nitrogen_fixation_kg_ha": 0,
    "nutrient_demand": "Low",
    "root_depth": "Deep",
    "drought_tolerance": "Very High",
    "heat_tolerance": "Very High",
    "economic_value": "Medium",
    "agronomic_benefits": "Thrives in low-fertility, drought-prone soils where all other grains fail; excellent fodder and gluten-free grain.",
    "preceding_crops": [
      "Wheat",
      "Chickpea",
      "Mustard"
    ],
    "succeeding_crops": [
      "Wheat",
      "Chickpea",
      "Lentils",
      "Mustard"
    ]
  },
  "Sugarcane": {
    "id": "sugarcane",
    "name": "Sugarcane (Kamad)",
    "scientific_name": "Saccharum officinarum",
    "season": "Annual/Kharif",
    "type": "Major Cash Crop",
    "water_demand_mm": 1400,
    "temp_opt_min": 22.0,
    "temp_opt_max": 35.0,
    "temp_limit_max": 42.0,
    "frost_sensitive": true,
    "soil_textures": [
      "Loamy",
      "Clay-Loam",
      "Clay"
    ],
    "soil_ph_min": 6.0,
    "soil_ph_max": 8.2,
    "soil_ph_opt": 7.2,
    "nitrogen_fixation_kg_ha": 0,
    "nutrient_demand": "High",
    "root_depth": "Deep",
    "drought_tolerance": "Medium",
    "heat_tolerance": "High",
    "economic_value": "High",
    "agronomic_benefits": "Major industrial sugar and bioenergy cash crop; provides tremendous biomass, bagasse, and press mud for soil organic matter.",
    "preceding_crops": [
      "Berseem",
      "Wheat",
      "Chickpea",
      "Lentils",
      "Mung Bean"
    ],
    "succeeding_crops": [
      "Wheat",
      "Berseem",
      "Chickpea",
      "Mustard"
    ]
  }
};
