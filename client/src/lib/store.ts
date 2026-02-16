import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShaderSettings {
    quality: number; // 0.1 to 1.0 (LOD)
    speed: number;   // 0.1 to 2.0
    paused: boolean;
}

interface HUDState {
    isDyslexic: boolean;
    isWarm: boolean;
    shaderSettings: ShaderSettings;

    toggleDyslexic: () => void;
    toggleWarm: () => void;
    setShaderSettings: (settings: Partial<ShaderSettings>) => void;
}

export const useHUDStore = create<HUDState>()(
    persist(
        (set) => ({
            isDyslexic: false,
            isWarm: false,
            shaderSettings: {
                quality: 1.0,
                speed: 1.0,
                paused: false,
            },

            toggleDyslexic: () => set((state) => ({ isDyslexic: !state.isDyslexic })),
            toggleWarm: () => set((state) => ({ isWarm: !state.isWarm })),
            setShaderSettings: (newSettings) => set((state) => ({
                shaderSettings: { ...state.shaderSettings, ...newSettings }
            })),
        }),
        {
            name: 'metis-hud-storage',
        }
    )
);
