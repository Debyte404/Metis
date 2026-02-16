"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Brain, Battery, Zap, Sun, Moon, Layout, Terminal, Cpu, Activity } from "lucide-react";
import FallingCodeSplash from "@/components/landing/FallingCodeSplash";
import { Button } from "@/components/ui/button";
import ShaderBackground from "@/components/landing/ShaderBackground";

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-slate-100 selection:bg-cyan-500/30 font-mono">
      {/* Landing Specific Shader */}
      <ShaderBackground />
      
      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {showSplash && (
          <FallingCodeSplash onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col min-h-screen"
        >
          {/* Header - Minimal "Tech" feel */}
          <header className="px-6 py-4 flex justify-between items-center border-b border-white/10 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-2 rounded-sm border border-cyan-500/50">
                  <Brain className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="font-bold tracking-widest text-lg text-slate-200">
                METIS<span className="text-cyan-500">.OS</span>
              </span>
            </div>
            <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
              <a href="#features" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <span className="text-cyan-700">//</span>Features
              </a>
              <a href="#about" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <span className="text-cyan-700">//</span>System
              </a>
              <a href="#pricing" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <span className="text-cyan-700">//</span>Access
              </a>
            </nav>
            <Button asChild variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300 rounded-none h-8 text-xs uppercase tracking-wider font-bold">
              <Link href="/auth/login">
                [ Login ]
              </Link>
            </Button>
          </header>

          {/* Hero Section - Brutalist/Outline Style */}
          <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-white/5 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] border border-white/5 pointer-events-none" />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-4xl space-y-6 relative"
            >
              {/* Decorative Tech Elements */}
              <div className="absolute -left-12 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent hidden md:block" />
              <div className="absolute -right-12 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent hidden md:block" />

              <div className="inline-flex items-center gap-3 px-3 py-1 border-l-2 border-cyan-500 bg-gradient-to-r from-cyan-950/50 to-transparent text-xs font-mono text-cyan-300 mb-6">
                <Activity className="w-3 h-3 animate-pulse" />
                SYSTEM STATUS: OPTIMIZED
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none [-webkit-text-stroke:3px_black] paint-order-stroke drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                Break <span className="text-cyan-400 [-webkit-text-stroke:3px_black]">Paralysis</span>
              </h1>
              <h2 className="text-3xl md:text-5xl font-black tracking-widest text-white uppercase mt-2 [-webkit-text-stroke:2px_black] paint-order-stroke drop-shadow-md">
                Initiate Momentum
              </h2>
              
              <p className="text-base md:text-xl text-white font-bold max-w-xl mx-auto leading-relaxed pt-6 font-mono drop-shadow-[0_2px_2px_rgba(0,0,0,1)] [-webkit-text-stroke:1px_black]">
                &gt; Initializing Neuro-Adaptive Protocols...<br/>
                &gt; Converting Overwhelming_Goals into <span className="text-cyan-400 [-webkit-text-stroke:1px_black]">MicroWins_v1.0</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-10">
                <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-6 rounded-none border-2 border-transparent hover:border-cyan-300 transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.3)] group">
                  <Link href="/auth/signup">
                    Start System <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-slate-300 hover:text-white border-b border-transparent hover:border-white rounded-none px-4 py-6 uppercase tracking-widest transition-all">
                  <Link href="/auth/login">
                    Run Diagnostics (Demo)
                  </Link>
                </Button>
              </div>
            </motion.div>
          </section>

          {/* Feature Grid - Outline / Cyberpunk Style */}
          <section id="features" className="px-6 py-20 w-full relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-4">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
                        Core Modules
                    </h3>
                    <div className="h-1 flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                    <span className="text-xs text-cyan-500 font-mono">V 1.0.4</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                    icon: <Cpu className="w-6 h-6 text-cyan-400" />,
                    title: "Chronotype Sync",
                    desc: "Tasks automatically aligned with biological energy windows.",
                    code: "ENERGY_LVL > 80% ? 'COMPLEX' : 'SIMPLE'"
                    },
                    {
                    icon: <Terminal className="w-6 h-6 text-pink-400" />,
                    title: "Cognitive Tuner",
                    desc: "Environment variables adjusted for maximum dopamine efficiency.",
                    code: "SET_MODE = 'ZEN' || 'GAMIFIED'"
                    },
                    {
                    icon: <Zap className="w-6 h-6 text-yellow-400" />,
                    title: "MicroWin Engine",
                    desc: "Deconstructs monolithic objectives into atomic executable units.",
                    code: "DECOMPOSE(PROJECT_X) -> [STEP_1...N]"
                    }
                ].map((feature, idx) => (
                    <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative p-6 bg-black/80 border border-white/10 hover:border-cyan-500/50 transition-colors"
                    >
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-cyan-500" />
                    </div>
                    
                    <div className="mb-4 flex justify-between items-start">
                        <div className="p-2 bg-white/5 border border-white/10">{feature.icon}</div>
                        <span className="text-[10px] text-slate-600 font-mono uppercase">MOD_0{idx+1}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 text-white uppercase tracking-wide">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4 font-mono">{feature.desc}</p>
                    
                    <div className="p-2 bg-black border border-white/5 text-[10px] text-cyan-700 font-mono code">
                        {feature.code}
                    </div>
                    </motion.div>
                ))}
                </div>
            </div>
          </section>

          {/* Footer - Minimal/Integrated */}
          <footer className="px-6 py-2 flex justify-between items-center text-[10px] font-mono text-slate-600 bg-black border-t border-white/10">
            <div className="flex items-center gap-4">
                <span>METIS_SYSTEMS &copy; 2026</span>
                <span className="hidden md:inline text-slate-800">|</span>
                <span className="hidden md:inline">LATENCY: 12ms</span>
            </div>
            <div className="flex gap-4 uppercase tracking-widest text-slate-500">
                <a href="#" className="hover:text-cyan-400">Legal</a>
                <a href="#" className="hover:text-cyan-400">Privacy</a>
                <a href="#" className="hover:text-cyan-400">Documentation</a>
            </div>
          </footer>
        </motion.div>

      )}
    </main>
  );
}
