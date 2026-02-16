"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useHUDStore } from "@/lib/store";
import { useTheme } from "next-themes";
import * as THREE from "three";

// Vertex Shader
const vertexShader = `
varying vec2 vUv;
varying float vElevation;

uniform float uTime;
uniform float uSpeed;

void main() {
  vUv = uv;
  
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Create a flowing river effect using sine waves
  float elevation = sin(modelPosition.x * 2.0 + uTime * uSpeed) * 0.1;
  elevation += sin(modelPosition.y * 5.0 + uTime * uSpeed * 0.5) * 0.05;
  
  modelPosition.z += elevation;
  vElevation = elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
`;

// Fragment Shader
const fragmentShader = `
varying vec2 vUv;
varying float vElevation;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;

void main() {
  // Creating a grid/data flow pattern
  float gridX = step(0.95, mod(vUv.x * 20.0 + uTime * 0.2, 1.0));
  float gridY = step(0.95, mod(vUv.y * 20.0, 1.0));
  float grid = max(gridX, gridY);

  // Mix colors based on elevation and grid
  vec3 color = mix(uColorA, uColorB, vElevation * 5.0 + 0.5);
  
  // Add the grid "data" lines
  color += grid * 0.5;

  // Add a vignette for depth
  float strength = distance(vUv, vec2(0.5));
  color *= 1.0 - strength * 0.8;

  gl_FragColor = vec4(color, 1.0);
}
`;

function DataRiver() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { shaderSettings } = useHUDStore();
    const { theme } = useTheme();

    const uniforms = useMemo(
        () => ({
          uTime: { value: 0 },
          uSpeed: { value: 1.0 },
          uColorA: { value: new THREE.Color("#1e293b") },
          uColorB: { value: new THREE.Color("#0f172a") },
        }),
        []
    );
    
    // Update uniforms based on theme
    useFrame((state, delta) => {
        if (!meshRef.current || shaderSettings.paused) return;

        const material = meshRef.current.material as THREE.ShaderMaterial;
        const time = state.clock.getElapsedTime();
        material.uniforms.uTime.value = time;
        // Apply speed multiplier to the time uniform calculation in the shader or here?
        // The shader uses uTime * uSpeed.
        // We update uTime to be absolute time.
        material.uniforms.uSpeed.value = shaderSettings.speed;

        // Theme colors
        const isDark = theme === 'dark';
        // Dark Mode: Deep Blues/Cyans
        // Light Mode: Subtle Greys/Teals
        const targetColorA = isDark ? new THREE.Color("#0f172a") : new THREE.Color("#f1f5f9"); 
        const targetColorB = isDark ? new THREE.Color("#3b82f6") : new THREE.Color("#94a3b8");

        // Lerp colors for smooth transition
        material.uniforms.uColorA.value.lerp(targetColorA, 0.05);
        material.uniforms.uColorB.value.lerp(targetColorB, 0.05);
    });

    // Adjust geometry complexity based on Quality settings
    const segmentCount = Math.max(10, Math.floor(64 * shaderSettings.quality)); 

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} scale={1.5}>
            <planeGeometry args={[10, 10, segmentCount, segmentCount]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                wireframe={false} // Could toggle this for "Matrix" look
            />
        </mesh>
    );
}

export function ShaderBackground() {
    return (
        <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 2], fov: 75 }}>
                <DataRiver />
            </Canvas>
        </div>
    );
}
