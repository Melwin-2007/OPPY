import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RoverModel } from './RoverModel';
import { CadGuideRails } from './CadGuideRails';
import { VisualProps } from './VisualProps';
import { PhaseEnvironment } from './PhaseEnvironment';

interface RoverCanvasProps {
  explodedFactor?: number;
  selectedSubsystem?: string | null;
  mode?: 'idle' | 'drive' | 'scan' | 'sample' | 'comm';
  simSpeed?: number;
  isWireframe?: boolean;
  isAutoOrbit?: boolean;
  phaseIndex?: number;
  className?: string;
}

export const RoverCanvas: React.FC<RoverCanvasProps> = ({
  explodedFactor = 0.0,
  selectedSubsystem = 'mast',
  mode = 'idle',
  simSpeed = 1.0,
  isWireframe = false,
  isAutoOrbit = false,
  phaseIndex = 2,
  className = 'w-full h-full'
}) => {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [2.4, 1.7, 2.7], fov: 42, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance'
        }}
        shadows
      >
        {/* Martian Lighting Rig */}
        <directionalLight
          position={[4.5, 7.5, 3.8]}
          intensity={2.8}
          color="#fff1e0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0003}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
          shadow-camera-left={-2.8}
          shadow-camera-right={2.8}
          shadow-camera-top={2.8}
          shadow-camera-bottom={-2.8}
        />
        <ambientLight intensity={1.4} color="#352822" />
        <hemisphereLight intensity={1.1} color="#ffd5b8" groundColor="#1f1917" />

        {/* Orbit Camera Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={0.7}
          maxDistance={8.5}
          target={[0.0, 0.65, 0.0]}
          autoRotate={isAutoOrbit}
          autoRotateSpeed={0.8}
        />

        {/* 3D Scene Components */}
        <Suspense fallback={null}>
          <PhaseEnvironment phaseIndex={phaseIndex} />
          <RoverModel
            explodedFactor={explodedFactor}
            selectedSubsystem={selectedSubsystem}
            mode={mode}
            simSpeed={simSpeed}
            isWireframe={isWireframe}
          />
          <CadGuideRails explodedFactor={explodedFactor} />
          <VisualProps mode={mode} simSpeed={simSpeed} />
        </Suspense>
      </Canvas>
    </div>
  );
};
