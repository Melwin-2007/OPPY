import React, { useEffect } from 'react';
import { useMissionStore } from '../stores/missionStore';
import { useStoryNarrator } from '../hooks/useStoryNarrator';
import { Navigation } from '../components/ui/Navigation';
import { RoverCanvas } from '../components/3d/RoverCanvas';
import { StoryOverlay } from '../components/story/StoryOverlay';
import { PhaseTimeline } from '../components/story/PhaseTimeline';
import { TelemetryHUD } from '../components/ui/TelemetryHUD';

interface ExperiencePageProps {
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
}

export const ExperiencePage: React.FC<ExperiencePageProps> = ({ isAudioPlaying, onToggleAudio }) => {
  const { phases, currentPhaseIndex, isPlaying, simSpeed, nextPhase, prevPhase } = useMissionStore();
  const currentPhase = phases[currentPhaseIndex] || phases[0];

  // Story Narration with Female Elegant Foreign Accent & Zero Overlap
  const narrationText = `${currentPhase.title}. ${currentPhase.headline}. ${currentPhase.narrativeText}`;
  const { isVoiceEnabled, toggleVoice } = useStoryNarrator(narrationText, currentPhase.id);

  // Auto progression timer when isPlaying is true
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextPhase();
    }, 10000 / simSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, nextPhase]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPhase();
      if (e.key === 'ArrowLeft') prevPhase();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPhase, prevPhase]);

  // Derive active simulation mode based on story phase
  const getSimulationMode = () => {
    if (currentPhaseIndex === 2) return 'sample'; // Phase 3: First Discoveries
    if (currentPhaseIndex === 3) return 'drive';  // Phase 4: Beyond Expectations traverse
    if (currentPhaseIndex === 4) return 'scan';   // Phase 5: Dust storm survey
    if (currentPhaseIndex === 5) return 'comm';   // Phase 6: Last dance DSN transmission
    return 'idle';
  };

  return (
    <div className="relative w-screen h-screen bg-oppy-bg overflow-hidden flex flex-col">
      {/* Top Navigation */}
      <Navigation isAudioPlaying={isAudioPlaying} onToggleAudio={onToggleAudio} />

      {/* Top Floating Telemetry Status & Narration Toggle */}
      <div className="absolute top-16 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex-1 min-w-[280px]">
          <TelemetryHUD
            statusText={`MISSION: ${currentPhase.phaseNumber} · ${currentPhase.title.toUpperCase()}`}
            odometerKm={currentPhase.odometerKm}
            subsystemState={`SOL RANGE: ${currentPhase.solRange[0]}–${currentPhase.solRange[1]}`}
          />
        </div>

        <button
          onClick={toggleVoice}
          className={`pointer-events-auto px-3.5 py-2 rounded-md border text-[11px] font-mono uppercase transition-all backdrop-blur-md flex items-center space-x-2 shadow-2xl ${
            isVoiceEnabled
              ? 'border-oppy-accent bg-[#0c0d0f]/90 text-white shadow-oppy-accent/20'
              : 'border-oppy-border bg-[#0c0d0f]/70 text-oppy-textMuted hover:text-white'
          }`}
          title="Toggle Female Elegant Storytelling Voice"
        >
          <span className={`w-2 h-2 rounded-full ${isVoiceEnabled ? 'bg-oppy-accent animate-pulse' : 'bg-oppy-textMuted'}`} />
          <span>{isVoiceEnabled ? '🎙️ NARRATOR: ON' : '🎙️ NARRATOR: OFF'}</span>
        </button>
      </div>

      {/* Primary Fullscreen 3D Viewport */}
      <div className="flex-1 w-full h-full">
        <RoverCanvas
          phaseIndex={currentPhaseIndex}
          mode={getSimulationMode()}
          simSpeed={simSpeed}
          className="w-full h-full"
        />
      </div>

      {/* Story Narrative Overlay (Non-Intrusive Floating Glass) */}
      <StoryOverlay phase={currentPhase} />

      {/* Milestone Scrubber & Transport Controller */}
      <PhaseTimeline />
    </div>
  );
};
