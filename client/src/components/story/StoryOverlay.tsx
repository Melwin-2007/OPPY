import React from 'react';
import { MissionPhase } from '../../types/mission';
import { Microscope, Compass, Sparkles } from 'lucide-react';

interface StoryOverlayProps {
  phase: MissionPhase;
}

export const StoryOverlay: React.FC<StoryOverlayProps> = ({ phase }) => {
  return (
    <div className="absolute bottom-24 left-4 sm:left-8 max-w-lg z-20 pointer-events-none">
      <div className="bg-[#0c0d0f]/85 backdrop-blur-md border border-oppy-border/70 rounded-lg p-5 sm:p-6 text-oppy-textSecondary shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between text-[11px] font-mono text-oppy-accent mb-2">
          <span>{phase.phaseNumber}</span>
          <span className="text-white bg-oppy-surface px-2 py-0.5 rounded border border-oppy-border/60">
            {phase.period}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2 font-sans">
          {phase.title}
        </h2>

        <h3 className="text-xs font-semibold text-oppy-textPrimary mb-3 font-sans">
          {phase.headline}
        </h3>

        <p className="text-xs leading-relaxed text-oppy-textSecondary mb-4">
          {phase.narrativeText}
        </p>

        {phase.discoveries.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-oppy-border/50 text-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-oppy-textMuted flex items-center space-x-1.5">
              <Microscope className="w-3 h-3 text-oppy-accent" />
              <span>KEY SCIENTIFIC DISCOVERY</span>
            </div>
            {phase.discoveries.map((d, i) => (
              <div key={i} className="bg-oppy-surface/60 rounded p-2.5 border border-oppy-border/40">
                <div className="flex justify-between items-center text-white font-medium text-xs mb-1">
                  <span>{d.title}</span>
                  <span className="text-[9px] font-mono text-oppy-accent">{d.instrument}</span>
                </div>
                <p className="text-[11px] text-oppy-textSecondary leading-normal">
                  {d.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
