"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function FallingCodeSplash({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const columns = Math.floor(width / 20);
    const drops = new Array(columns).fill(1);
    
    // Code snippets or characters to fall
    const characters = "0123456789ABCDEF{}[]<>=+/;var const let function return if else while for";
    
    let frameId: number;
    let startTime = Date.now();
    const duration = 2500; // 3 seconds duration for splash

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#0F0"; // Green text (Matrix style) -> Or Blueish to match theme?
      // Let's go with a Cyan/Blueish to match the new theme
      ctx.fillStyle = "#00BFFF"; 
      ctx.font = "15px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      if (Date.now() - startTime < duration) {
        frameId = requestAnimationFrame(draw);
      } else {
        onComplete();
      }
    };

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  return (
    <motion.div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            Counsel of Metis
        </h1>
        <p className="mt-2 text-blue-200 text-sm tracking-widest uppercase">Initializing Neuro-Adaptive System...</p>
      </motion.div>
    </motion.div>
  );
}
