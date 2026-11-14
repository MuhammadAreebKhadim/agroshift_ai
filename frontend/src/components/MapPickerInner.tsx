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
    <div className="h-full min-h-[440px] w-full relative rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-xl bg-slate-900 flex flex-col">
      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Mode Toggle */}
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 border border-slate-200 shadow-lg text-xs font-bold pointer-events-auto">
          <button
            type="button"
            onClick={() => setMapMode("streets")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              mapMode === "streets"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:text-blue-600"
            }`}
          >
            <span>🗺️ OpenStreetMap</span>
          </button>
          <button
            type="button"
            onClick={() => setMapMode("satellite")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              mapMode === "satellite"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:text-blue-600"
            }`}
          >
            <span>🛰️ Satellite Imagery</span>
          </button>
        </div>

        {/* Top-Center Location Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-500/50 text-white text-xs font-bold shadow-2xl flex items-center gap-2 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">Detected:</span>
          <span className="text-emerald-300 font-extrabold text-xs">📍 {displayName}</span>
        </div>

        {/* Quick Regional Presets (Clean names) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-lg text-xs font-semibold pointer-events-auto">
          <span className="text-slate-500 font-bold mr-1">Presets:</span>
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
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-800 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Real Full-Featured Interactive Leaflet Map */}
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
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
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

      {/* Bottom Floating Info Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 text-white text-xs shadow-2xl flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-slate-300">Selected:</span>
            <span className="font-sans text-blue-300 font-extrabold">📍 {displayName}</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-cyan-300 font-bold">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Scroll wheel to zoom • Drag to pan • Click map to sync soil & climatology
          </span>
        </div>

        <div className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg border border-blue-400 pointer-events-auto">
          Leaflet + OpenStreetMap Active
        </div>
      </div>
    </div>
  );
}
