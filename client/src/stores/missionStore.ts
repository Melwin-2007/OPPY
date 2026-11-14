import { create } from 'zustand';
import missionPhasesData from '../data/missionPhases.json';
import { MissionPhase } from '../types/mission';

interface MissionState {
  phases: MissionPhase[];
  currentPhaseIndex: number;
  isPlaying: boolean;
  simSpeed: 1 | 2 | 4;
  roverAnimationMode: 'idle' | 'drive' | 'scan' | 'sample' | 'comm';
  setPhaseIndex: (index: number) => void;
  nextPhase: () => void;
  prevPhase: () => void;
  togglePlay: () => void;
  setSimSpeed: (speed: 1 | 2 | 4) => void;
  setAnimationMode: (mode: MissionState['roverAnimationMode']) => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  phases: missionPhasesData as MissionPhase[],
  currentPhaseIndex: 0,
  isPlaying: false,
  simSpeed: 1,
  roverAnimationMode: 'idle',

  setPhaseIndex: (index) => {
    const validIndex = Math.max(0, Math.min(index, get().phases.length - 1));
    set({ currentPhaseIndex: validIndex });
  },

  nextPhase: () => {
    const { currentPhaseIndex, phases } = get();
    if (currentPhaseIndex < phases.length - 1) {
      set({ currentPhaseIndex: currentPhaseIndex + 1 });
    }
  },

  prevPhase: () => {
    const { currentPhaseIndex } = get();
    if (currentPhaseIndex > 0) {
      set({ currentPhaseIndex: currentPhaseIndex - 1 });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSimSpeed: (speed) => set({ simSpeed: speed }),
  setAnimationMode: (mode) => set({ roverAnimationMode: mode })
}));
