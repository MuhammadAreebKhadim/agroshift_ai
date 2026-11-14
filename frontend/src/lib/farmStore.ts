export interface StoredFarm {
  id: number;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  area: number;
  soil_type: string;
  soil_ph: number;
  irrigation_type: string;
  current_crop: string;
  priority: string;
  created_at: string;
}

export const defaultFarm: StoredFarm = {
  id: 1,
  name: "Al-Rehman Green Farm",
  location_name: "Faisalabad, Pakistan",
  latitude: 31.4504,
  longitude: 73.1350,
  area: 30.0,
  soil_type: "Loamy",
  soil_ph: 7.5,
  irrigation_type: "Canal / Groundwater",
  current_crop: "Wheat",
  priority: "Water conservation",
  created_at: new Date().toISOString(),
};

export const globalFarmsDb: StoredFarm[] = [defaultFarm];

export function getLatestStoredFarm(): StoredFarm {
  return globalFarmsDb[0] || defaultFarm;
}

export function addStoredFarm(farm: Partial<StoredFarm>): StoredFarm {
  const newFarm: StoredFarm = {
    ...defaultFarm,
    ...farm,
    id: globalFarmsDb.length + 1,
    created_at: new Date().toISOString(),
  };
  globalFarmsDb.unshift(newFarm);
  return newFarm;
}
