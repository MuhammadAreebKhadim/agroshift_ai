"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  onChange: (lat: number, lon: number) => void;
}

// Map Controller for click events and smooth flyTo
function MapController({
  lat,
  lon,
  onChange,
}: {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      const newLat = Number(e.latlng.lat.toFixed(4));
      const newLon = Number(e.latlng.lng.toFixed(4));
      onChange(newLat, newLon);
      map.flyTo(e.latlng, map.getZoom(), { duration: 0.6 });
    },
  });

  // Force map to adapt to its container size immediately on mount
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);

  // Smoothly center when coordinates change from outside
  useEffect(() => {
    const currentCenter = map.getCenter();
    const dist = Math.abs(currentCenter.lat - lat) + Math.abs(currentCenter.lng - lon);
    if (dist > 0.0001) {
      map.flyTo([lat, lon], map.getZoom(), { duration: 0.8 });
    }
  }, [lat, lon, map]);

  return null;
}

export default function MapPickerInner({ latitude, longitude, locationName, onChange }: MapPickerProps) {
  const [mapMode, setMapMode] = useState<"streets" | "satellite">("streets");
  const markerRef = useRef<L.Marker | null>(null);

  const displayName = locationName || "Faisalabad";

  // Reliable OpenStreetMap and Esri Satellite endpoints
  const streetsUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  // Custom high-visibility HTML5 marker icon with detected area label
  const pinIcon = useMemo(() => {
    return L.divIcon({
      className: "custom-farm-pin",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;">
          <div style="background: #1e40af; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2px solid #ffffff; white-space: nowrap; margin-bottom: 2px;">
            📍 ${displayName}
          </div>
          <div style="width: 24px; height: 24px; background: #dc2626; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 14px rgba(220,38,38,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 900;">
            ●
          </div>
          <div style="width: 2px; height: 8px; background: #dc2626;"></div>
        </div>
      `,
      iconSize: [28, 48],
      iconAnchor: [14, 48],
    });
  }, [displayName]);

  // Quick preset jump
  const jumpToLocation = (lat: number, lon: number) => {
    onChange(lat, lon);
  };

  // Draggable marker handlers
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onChange(Number(newPos.lat.toFixed(4)), Number(newPos.lng.toFixed(4)));
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="w-full flex flex-col space-y-2.5">
      {/* 1. TOP HEADER (OUTSIDE MAP BOX): Live Detected Location on Left, Layer Toggle & Presets on Right */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
        {/* Live Detected Location on Top-Left Corner Outside Map */}
        <div className="bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 shadow-sm flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">Detected:</span>
          <span className="text-emerald-300 font-extrabold text-xs">📍 {displayName}</span>
        </div>

        {/* Layer Toggles & Regional Presets on Top-Right Corner Outside Map */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Map Layer Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMapMode("streets")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === "streets"
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-slate-700 hover:text-blue-600"
              }`}
            >
              <span>🗺️ OpenStreetMap</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode("satellite")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === "satellite"
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-slate-700 hover:text-blue-600"
              }`}
            >
              <span>🛰️ Satellite</span>
            </button>
          </div>

          {/* Quick Regional Presets */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <span className="text-slate-400 font-bold mr-0.5 text-[11px]">Presets:</span>
            {[
              { name: "Faisalabad", lat: 31.4504, lon: 73.1350 },
              { name: "Multan", lat: 30.1575, lon: 71.5249 },
              { name: "Lahore", lat: 31.5204, lon: 74.3587 },
              { name: "Sahiwal", lat: 30.6682, lon: 73.1114 },
              { name: "R.Y. Khan", lat: 28.4212, lon: 70.2989 },
            ].map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => jumpToLocation(p.lat, p.lon)}
                className="px-2 py-0.5 rounded bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-700 text-[11px] transition-colors cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THE MAP BOX (Clean and Spacious Canvas) */}
      <div className="h-[460px] sm:h-[500px] w-full relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-900">
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          zoomControl={true}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            key={mapMode}
            attribution={
              mapMode === "streets"
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                : 'Tiles &copy; Esri &mdash; Earth Imagery'
            }
            url={mapMode === "streets" ? streetsUrl : satelliteUrl}
            maxZoom={19}
          />

          <MapController lat={latitude} lon={longitude} onChange={onChange} />

          <Marker
            position={[latitude, longitude]}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
            icon={pinIcon}
          >
            <Tooltip permanent direction="top" offset={[0, -44]} className="agro-map-marker-badge font-bold">
              📍 {displayName}
            </Tooltip>
          </Marker>
        </MapContainer>

        {/* Selected Location With Dimension in Bottom-Left Corner INSIDE Map Box */}
        <div className="absolute bottom-3 left-3 z-[1000] pointer-events-auto bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 text-white text-xs shadow-xl flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
          <span className="font-semibold text-slate-400">Selected:</span>
          <span className="font-bold text-blue-300">📍 {displayName}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-cyan-300 font-bold">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-emerald-400 font-extrabold hidden sm:inline">30.0 Acres</span>
        </div>
      </div>

      {/* 3. BOTTOM FOOTER (OUTSIDE MAP BOX): Leaflet + OpenStreetMap Active on Bottom-Left Corner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        {/* Leaflet + OpenStreetMap Active OUT OF BOX in Bottom-Left Corner */}
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Leaflet + OpenStreetMap Active
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Scroll wheel to zoom • Drag pin to relocate farm boundary • Click anywhere to reposition
        </div>
      </div>
    </div>
  );
}
