"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sprout, 
  Satellite, 
  RotateCw, 
  Sliders, 
  Bot, 
  MapPin, 
  Sparkles,
  FileText
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Farm Setup", href: "/farm-setup", icon: MapPin },
    { name: "NASA Intelligence", href: "/dashboard", icon: Satellite },
    { name: "Rotation Planner", href: "/rotation-planner", icon: RotateCw },
    { name: "What-If Simulator", href: "/simulator", icon: Sliders, highlight: true },
    { name: "AI Assistant", href: "/assistant", icon: Bot },
    { name: "Action Plan", href: "/report", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & NASA Hackathon Badge */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
                  AgroShift <span className="text-blue-600">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold -mt-1 tracking-wider uppercase">
                  NASA Earth Intelligence
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700">
              <Satellite className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>NASA POWER API</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                      : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/80"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : item.highlight ? "text-amber-500" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                  {item.highlight && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                      isActive ? "bg-amber-400 text-slate-950" : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      KEY
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
