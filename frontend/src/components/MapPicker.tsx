"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[300px] flex flex-col items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
      <span className="text-xs">Loading OpenStreetMap Earth Canvas...</span>
    </div>
  ),
});

interface MapPickerProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  onChange: (lat: number, lon: number) => void;
}

export default function MapPicker(props: MapPickerProps) {
  return <MapPickerInner {...props} />;
}
