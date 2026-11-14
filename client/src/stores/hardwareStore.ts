import { create } from 'zustand';
import subsystemsData from '../data/subsystems.json';
import { Subsystem } from '../types/hardware';

interface HardwareState {
  subsystems: Subsystem[];
  selectedSubsystemKey: string;
  explodedFactor: number;
  isAutoOrbit: boolean;
  isWireframe: boolean;
  setSelectedSubsystem: (key: string) => void;
  setExplodedFactor: (factor: number) => void;
  toggleAutoOrbit: () => void;
  toggleWireframe: () => void;
}

export const useHardwareStore = create<HardwareState>((set) => ({
  subsystems: subsystemsData as Subsystem[],
  selectedSubsystemKey: 'mast',
  explodedFactor: 0.0,
  isAutoOrbit: false,
  isWireframe: false,

  setSelectedSubsystem: (key) => set({ selectedSubsystemKey: key }),
  setExplodedFactor: (factor) => set({ explodedFactor: Math.max(0, Math.min(1, factor)) }),
  toggleAutoOrbit: () => set((state) => ({ isAutoOrbit: !state.isAutoOrbit })),
  toggleWireframe: () => set((state) => ({ isWireframe: !state.isWireframe }))
}));
