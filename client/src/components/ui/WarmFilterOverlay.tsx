"use client";

import { useHUDStore } from "@/lib/store";
import { useEffect, useState } from "react";

export function WarmFilterOverlay() {
  const isWarm = useHUDStore((state) => state.isWarm);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isWarm) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] warm-overlay w-screen h-screen" aria-hidden="true" />
  );
}
