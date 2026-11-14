import React, { Suspense } from 'react';
import { MartianTerrain } from './MartianTerrain';

interface PhaseEnvironmentProps {
  phaseIndex: number;
}

export const PhaseEnvironment: React.FC<PhaseEnvironmentProps> = ({ phaseIndex }) => {
  return (
    <Suspense fallback={<MartianTerrain />}>
      <MartianTerrain />
    </Suspense>
  );
};
