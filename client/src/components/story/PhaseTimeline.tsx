import React from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

export const PhaseTimeline: React.FC = () => {
  const {
    phases,
    currentPhaseIndex,
    setPhaseIndex,
    nextPhase,
    prevPhase,
    isPlaying,
    togglePlay,
    simSpeed,
    setSimSpeed
  } = useMissionStore();

  return (
    <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none flex justify-center">
      <div className="bg-[#0c0d0f]/90 backdrop-blur-md border border-oppy-border/80 rounded-md px-4 py-2.5 pointer-events-auto flex flex-wrap items-center justify-between gap-4 max-w-4xl w-full shadow-2xl font-mono text-xs">
        
        {/* Navigation Step Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={prevPhase}
            disabled={currentPhaseIndex === 0}
            className="p-1.5 rounded border border-oppy-border bg-oppy-surface hover:border-oppy-accent text-white disabled:opacity-30 disabled:hover:border-oppy-border transition-colors"
            title="Previous Story Phase"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="px-2.5 py-1.5 rounded border border-oppy-border bg-oppy-surface hover:border-oppy-accent text-white flex items-center space-x-1.5 transition-colors"
            title={isPlaying ? 'Pause Auto Progression' : 'Play Auto Progression'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[10px] hidden sm:inline">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={nextPhase}
            disabled={currentPhaseIndex === phases.length - 1}
            className="p-1.5 rounded border border-oppy-border bg-oppy-surface hover:border-oppy-accent text-white disabled:opacity-30 disabled:hover:border-oppy-border transition-colors"
            title="Next Story Phase"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Milestone Indicator Track */}
        <div className="flex items-center space-x-2 flex-1 justify-center max-w-md mx-2">
          {phases.map((phase, idx) => {
            const isActive = idx === currentPhaseIndex;
            const isCompleted = idx < currentPhaseIndex;
            return (
              <button
                key={phase.id}
                onClick={() => setPhaseIndex(idx)}
                className="group flex flex-col items-center focus:outline-none"
                title={`${phase.phaseNumber} · ${phase.title}`}
              >
                <div
                  className={`w-3 h-3 rounded-full border transition-all ${
                    isActive
                      ? 'border-oppy-accent bg-oppy-accent scale-125'
                      : isCompleted
                      ? 'border-oppy-textSecondary bg-oppy-textMuted'
                      : 'border-oppy-border bg-oppy-surface hover:border-oppy-borderLight'
                  }`}
                />
                <span className="text-[9px] mt-1 text-oppy-textMuted group-hover:text-white hidden md:inline">
                  {`0${idx + 1}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Speed Multiplier Selectors */}
        <div className="flex items-center space-x-1 bg-oppy-bg border border-oppy-border rounded p-0.5 text-[9px]">
          {([1, 2, 4] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSimSpeed(s)}
              className={`px-2 py-0.5 rounded transition-colors ${
                simSpeed === s ? 'bg-oppy-surface text-white font-bold' : 'text-oppy-textMuted hover:text-white'
              }`}
            >
              {s}X
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
