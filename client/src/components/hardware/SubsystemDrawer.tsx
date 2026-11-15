import React from 'react';
import { useHardwareStore } from '../../stores/hardwareStore';
import { useStoryNarrator } from '../../hooks/useStoryNarrator';
import { Layers, RotateCcw, Eye, Sparkles, Volume2, VolumeX } from 'lucide-react';

export const SubsystemDrawer: React.FC = () => {
  const {
    subsystems,
    selectedSubsystemKey,
    setSelectedSubsystem,
    explodedFactor,
    setExplodedFactor,
    isAutoOrbit,
    toggleAutoOrbit,
    isWireframe,
    toggleWireframe
  } = useHardwareStore();

  const activeSubsystem = subsystems.find((s) => s.key === selectedSubsystemKey) || subsystems[0];

  const speechScript = activeSubsystem
    ? `${activeSubsystem.name}. ${activeSubsystem.desc} Engineering to discovery link: ${activeSubsystem.discoveryLink.scienceFinding} ${activeSubsystem.discoveryLink.significance}`
    : '';

  const { isVoiceEnabled, toggleVoice } = useStoryNarrator(speechScript, selectedSubsystemKey);

  return (
    <aside className="w-full lg:w-96 flex flex-col space-y-4 font-mono text-xs z-20">
      
      {/* Subsystem Selection Grid */}
      <div className="bg-oppy-card p-4 rounded-md border border-oppy-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-oppy-textMuted uppercase tracking-wider">
            SELECT SUBSYSTEM FOCUS
          </span>
          <button
            onClick={toggleVoice}
            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-mono flex items-center space-x-1.5 transition-colors border cursor-pointer ${
              isVoiceEnabled
                ? 'border-oppy-accent bg-oppy-surface text-white'
                : 'border-oppy-border bg-oppy-bg text-oppy-textMuted hover:text-white'
            }`}
            title="Toggle Hardware Storyteller Voice"
          >
            {isVoiceEnabled ? (
              <Volume2 className="w-3 h-3 text-oppy-accent animate-pulse" />
            ) : (
              <VolumeX className="w-3 h-3 text-oppy-textMuted" />
            )}
            <span>VOICE: {isVoiceEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {subsystems.map((sub, idx) => {
            const isSelected = sub.key === selectedSubsystemKey;
            return (
              <button
                key={sub.key}
                onClick={() => setSelectedSubsystem(sub.key)}
                className={`px-3 py-2 text-left rounded text-xs transition-all border ${
                  isSelected
                    ? 'border-oppy-accent bg-oppy-surface text-white'
                    : 'border-oppy-border bg-oppy-bg text-oppy-textSecondary hover:border-oppy-borderLight hover:text-white'
                }`}
              >
                {`0${idx + 1}. ${sub.name.split(' ')[0]}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exploded View & Mode Controls */}
      <div className="bg-oppy-card p-4 rounded-md border border-oppy-border flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-oppy-textMuted uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-oppy-accent" />
            <span>EXPLODED CAD VIEW:</span>
          </span>
          <span className="text-white font-bold">{Math.round(explodedFactor * 100)}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(explodedFactor * 100)}
          onChange={(e) => setExplodedFactor(parseFloat(e.target.value) / 100)}
          className="w-full h-1 bg-oppy-border rounded-lg appearance-none cursor-pointer accent-oppy-accent"
        />

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => setExplodedFactor(explodedFactor > 0.5 ? 0.0 : 1.0)}
            className="px-2 py-1.5 rounded border border-oppy-border bg-oppy-surface hover:border-oppy-accent text-white text-[10px] uppercase text-center transition-colors"
          >
            {explodedFactor > 0.5 ? 'ASSEMBLE' : 'EXPLODE'}
          </button>

          <button
            onClick={toggleAutoOrbit}
            className={`px-2 py-1.5 rounded border text-[10px] uppercase text-center transition-colors ${
              isAutoOrbit
                ? 'border-oppy-accent bg-oppy-surface text-white'
                : 'border-oppy-border bg-oppy-surface hover:border-oppy-accent text-oppy-textSecondary'
            }`}
          >
            AUTO-ORBIT
          </button>

          <button
            onClick={toggleWireframe}
            className={`px-2 py-1.5 rounded border text-[10px] uppercase text-center transition-colors ${
              isWireframe
                ? 'border-oppy-accent bg-oppy-surface text-white'
                : 'border-oppy-border bg-oppy-surface hover:border-oppy-accent text-oppy-textSecondary'
            }`}
          >
            WIREFRAME
          </button>
        </div>
      </div>

      {/* Dynamic Technical Details & Engineering to Discovery Link */}
      <div className="bg-oppy-card p-5 rounded-md border border-oppy-border/80 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-oppy-accent uppercase tracking-wider mb-1">
            <span>{activeSubsystem.id}</span>
            <span className="text-white">MASS: {activeSubsystem.mass}</span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight mb-2 font-sans">
            {activeSubsystem.name}
          </h3>

          <p className="text-xs text-oppy-textSecondary leading-relaxed mb-4 font-sans">
            {activeSubsystem.desc}
          </p>

          <div className="space-y-1.5 pt-3 border-t border-oppy-border/50 text-[11px]">
            <div className="flex justify-between text-oppy-textMuted">
              <span>VOLTAGE BUS:</span>
              <span className="text-white">{activeSubsystem.volt}</span>
            </div>
            <div className="flex justify-between text-oppy-textMuted">
              <span>SPECIFICATION:</span>
              <span className="text-white">{activeSubsystem.spec}</span>
            </div>
            <div className="flex justify-between text-oppy-textMuted">
              <span>TEMPERATURE:</span>
              <span className="text-white">{activeSubsystem.temp}</span>
            </div>
          </div>
        </div>

        {/* The Crucial Engineering to Discovery Connection */}
        <div className="mt-4 pt-4 border-t border-oppy-border/60 bg-oppy-surface/40 p-3 rounded">
          <div className="text-[10px] font-mono uppercase tracking-wider text-oppy-accent flex items-center space-x-1 mb-1">
            <Sparkles className="w-3 h-3 text-oppy-accent" />
            <span>ENGINEERING TO DISCOVERY LINK</span>
          </div>
          <div className="text-white font-medium text-xs mb-1 font-sans">
            {activeSubsystem.discoveryLink.scienceFinding}
          </div>
          <p className="text-[11px] text-oppy-textSecondary leading-normal font-sans">
            {activeSubsystem.discoveryLink.significance}
          </p>
        </div>
      </div>

    </aside>
  );
};
