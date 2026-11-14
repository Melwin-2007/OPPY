import React from 'react';
import { useHardwareStore } from '../stores/hardwareStore';
import { Navigation } from '../components/ui/Navigation';
import { RoverCanvas } from '../components/3d/RoverCanvas';
import { SubsystemDrawer } from '../components/hardware/SubsystemDrawer';
import { TelemetryHUD } from '../components/ui/TelemetryHUD';

interface HardwarePageProps {
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
}

export const HardwarePage: React.FC<HardwarePageProps> = ({ isAudioPlaying, onToggleAudio }) => {
  const {
    selectedSubsystemKey,
    explodedFactor,
    isAutoOrbit,
    isWireframe
  } = useHardwareStore();

  return (
    <div className="relative w-screen h-screen bg-oppy-bg overflow-hidden flex flex-col">
      {/* Top Navigation */}
      <Navigation isAudioPlaying={isAudioPlaying} onToggleAudio={onToggleAudio} />

      {/* Main Content Area */}
      <div className="flex-1 w-full h-full pt-16 pb-4 px-4 sm:px-6 flex flex-col lg:flex-row gap-4 items-stretch overflow-hidden">
        
        {/* Primary 3D Hardware Viewport */}
        <div className="flex-1 relative rounded-lg border border-oppy-border bg-oppy-card overflow-hidden flex flex-col min-h-[350px]">
          
          {/* Viewport Top Telemetry Header */}
          <div className="px-4 py-2.5 bg-[#101113]/85 backdrop-blur-md border-b border-oppy-border/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-oppy-accent">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">MER-B 3D CAD ENGINE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-oppy-surface text-oppy-textMuted border border-oppy-border/60">
                1:1 REAL FLIGHT HARDWARE
              </span>
            </div>
            <div className="text-[11px] text-oppy-textMuted hidden sm:inline">
              SCALE: 2.28m × 1.58m · MASS: 185 kg
            </div>
          </div>

          {/* 3D Canvas Container */}
          <div className="flex-1 w-full h-full relative">
            <RoverCanvas
              explodedFactor={explodedFactor}
              selectedSubsystem={selectedSubsystemKey}
              isAutoOrbit={isAutoOrbit}
              isWireframe={isWireframe}
              className="w-full h-full"
            />
          </div>

          {/* Viewport Bottom Guide */}
          <div className="px-4 py-2 bg-[#101113]/90 border-t border-oppy-border/60 flex items-center justify-between text-[10px] font-mono text-oppy-textMuted">
            <span>DRAG: ORBIT CAMERA · WHEEL: ZOOM · CLICK PART: FOCUS</span>
            <span className="text-oppy-accent">CYAN GUIDE RAILS ACTIVE</span>
          </div>
        </div>

        {/* Subsystem & Technical Callouts Drawer */}
        <SubsystemDrawer />

      </div>
    </div>
  );
};
