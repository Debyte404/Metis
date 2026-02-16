"use client";

import { useState, useRef, useEffect } from "react";
import { Sliders, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHUDStore } from "@/lib/store";

export function PerformanceHUD() {
  const { shaderSettings, setShaderSettings } = useHUDStore();
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const [mounted, setMounted] = useState(false);

  // Map settings between 0-1 (store) and 1-64 (display/user)
  const lod = Math.max(1, Math.round(shaderSettings.quality * 64));

  useEffect(() => {
    setMounted(true);
    let requestRef: number;
    
    const animate = (time: number) => {
      frameCount.current++;
      if (time - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (time - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = time;
      }
      requestRef = requestAnimationFrame(animate);
    };
    
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-auto">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-lg text-xs font-mono text-blue-200">
        <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>SYSTEM_STATUS</span>
        </div>
        <div className="flex justify-between gap-4">
            <span>FPS:</span>
            <span className={cn("font-bold", fps < 30 ? "text-red-400" : "text-green-400")}>{fps}</span>
        </div>
        <div className="flex justify-between gap-4">
            <span>LOD:</span>
            <span className="text-cyan-400">{lod.toFixed(1)}</span>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-lg w-48">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-blue-200">
            <Sliders className="w-3 h-3" />
            <span>RENDER_QUALITY</span>
        </div>
        <input
          type="range"
          min="1"
          max="64"
          step="1"
          value={lod}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            // Convert 1-64 back to 0-1
            setShaderSettings({ quality: val / 64 });
          }}
          className="w-full h-1 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
        />
        <div className="flex justify-between text-[10px] text-blue-400 mt-1 uppercase">
            <span>Performant</span>
            <span>Ultra</span>
        </div>
      </div>
    </div>
  );
}
