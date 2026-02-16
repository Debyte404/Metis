"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useHUDStore } from "@/lib/store";

// Custom Shader Material that mimics the requested "Rings" effect
// Adapted and tuned for a "blueish" aesthetic
const RingShaderMaterial = {
  uniforms: {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() },
    iLOD: { value: 16.0 }, // Level of Detail (Iteration count)
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float iTime;
    uniform vec3 iResolution;
    varying vec2 vUv;

    // --- UTILS ---
    mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
    }
    
    // --- FRACTAL DISTANCE ESTIMATOR ---
    // Menger Sponge Variation (KIFS)
    float map(vec3 p) {
        float s = 1.0;
        
        // Setup Chaos Modulation
        // The folding angle shifts over time from perfect 90 degrees (Order)
        // to slightly offset/wobbly (Chaos)
        float chaos = sin(iTime * 0.2) * 0.1; 
        
        // Iterative Folding (Generating Geometry)
        for(int i = 0; i < 5; i++) {
            // Absolute Abs Fold (Symmetry)
            p = abs(p);
            
            // Domain Repetition / Folding
            if(p.x < p.y) p.xy = p.yx;
            if(p.x < p.z) p.xz = p.zx;
            if(p.y < p.z) p.yz = p.zy;
            
            // Scaling and Offset (Menger Logic)
            p = p * 3.0 - 2.0;
            s *= 3.0; // Track scale factor
            
            // Chaos Rotation (Transition)
            p.z += chaos; 
            p.xy *= rot(chaos * 2.0);
        }
        
        // Distance to the final box shape
        // "s" divides the distance to bring it back to world scale
        return (length(p) - 1.5) / s;
    }

    void main() {
        vec2 uv = (vUv - 0.5) * iResolution.xy / iResolution.y;
        
        // --- CAMERA ---
        // Move camera through the sponge over time
        // The fractal repeats, so moving Z gives infinite fly-through feel
        vec3 ro = vec3(0.0, 0.0, iTime * 0.8); 
        vec3 rd = normalize(vec3(uv, 1.0));
        
        // Slight rotation to look around
        rd.xy *= rot(iTime * 0.1);
        
        // --- RAYMARCHING ---
        float t = 0.0;     // Total distance traveled
        float d = 0.0;     // Current distance estimate
        float glow = 0.0;  // Accumulator for the "Neon" look
        int steps = 0;
        
        // March
        for(int i = 0; i < 64; i++) {
            vec3 p = ro + rd * t;
            
            // Modulate space to make it infinite/repeating
            // We wrap the world coordinate p to keep generating geometry
            // "mod(..., 4.0) - 2.0" centers the repetition
            vec3 mapPos = mod(p, 4.0) - 2.0;
            
            d = map(mapPos);
            
            // Glow Accumulation
            // Light up areas near geometry
            // 0.05 / (d*d + ...) creates a hotspot at surface
            glow += 0.02 / (d * d + 0.05); 
            
            // Move forward
            t += d;
            steps = i;
            
            // Break if hit or too far
            if(d < 0.001 || t > 50.0) break;
        }
        
        // --- COLORING ---
        // Re-calculate final position for coloring logic
        vec3 finalP = ro + rd * t;
        
        // New Vibrant Palette: "Hyperspace"
        vec3 col = vec3(0.0);
        
        // Dynamic Palette based on depth and position
        // This creates a rainbow/oil-slick effect on the geometry edges
        vec3 pColor = 0.5 + 0.5 * cos(3.0 + d * 10.0 + vec3(0.0, 0.6, 1.0) + finalP.z * 0.1);
        
        // Base Glow: Mix of Deep Blue and the dynamic palette
        // 'glow' is accumulated intensity near geometry
        vec3 glowBase = mix(vec3(0.1, 0.5, 1.0), pColor, 0.5 * sin(iTime * 0.2));
        
        col += glow * glowBase * 0.12; // Increased intensity (0.08 -> 0.12)
        
        // Hotspots: Add a "Core" of white/gold energy where detail is highest
        col += vec3(1.0, 0.8, 0.5) * pow(glow, 2.5) * 0.002;
        
        // Fog: Fade to dark void color (Deep Purple/Black)
        col = mix(col, vec3(0.02, 0.0, 0.05), 1.0 - exp(-t * 0.08));
        
        // Tone Mapping
        col = pow(col, vec3(0.45)); 
        
        gl_FragColor = vec4(col, 1.0);
    }
  `,
};

function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree();
  const { shaderSettings } = useHUDStore();
  
  // Map quality (0-1) to LOD (8-64)
  const lod = Math.max(8, Math.floor(shaderSettings.quality * 64));

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(size.width, size.height, 1) },
      iLOD: { value: lod }, // Use mapped LOD
    }),
    []
  );

  useEffect(() => {
    uniforms.iResolution.value.set(size.width, size.height, 1);
  }, [size, uniforms]);

  useEffect(() => {
    uniforms.iLOD.value = lod;
  }, [lod, uniforms]);

  useFrame((state) => {
      if (meshRef.current && !shaderSettings.paused) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.iTime.value = state.clock.elapsedTime * shaderSettings.speed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={RingShaderMaterial.vertexShader}
        fragmentShader={RingShaderMaterial.fragmentShader}
      />
    </mesh>
  );
}

export default function ShaderBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 2]} // Handle high DPI screens
        gl={{ preserveDrawingBuffer: false }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
