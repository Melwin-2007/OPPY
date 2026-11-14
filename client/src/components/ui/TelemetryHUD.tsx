import React from 'react';

interface TelemetryHUDProps {
  statusText?: string;
  odometerKm?: number;
  subsystemState?: string;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  statusText = 'STATUS: STANDBY · ALL SYSTEMS NOMINAL',
  odometerKm = 45.161,
  subsystemState = 'ACTUATORS: 28V DC REGULATED'
}) => {
  return (
    <div className="px-4 py-2 bg-[#0c0d0f]/85 backdrop-blur-md border border-oppy-border/50 text-[10px] font-mono text-oppy-textSecondary flex flex-wrap items-center justify-between gap-2 rounded-md">
      <div className="flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-oppy-accent animate-ping" />
        <span className="text-white font-medium">{statusText}</span>
      </div>
      <div className="flex items-center space-x-4 text-oppy-textMuted">
        <span>{subsystemState}</span>
        <span className="text-white">ODOMETER: {odometerKm.toFixed(3)} km</span>
        <span className="text-oppy-accent hidden sm:inline">MERIDIANI PLANUM</span>
      </div>
    </div>
  );
};
