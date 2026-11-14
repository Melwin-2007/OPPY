import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CadGuideRailsProps {
  explodedFactor: number;
}

const RAIL_ANCHORS = [
  { anchor: new THREE.Vector3(0.00, 0.68,  0.37), delta: new THREE.Vector3(0.00,  0.80,  0.18) }, // Mast
  { anchor: new THREE.Vector3(0.00, 0.67, -0.12), delta: new THREE.Vector3(0.00,  0.42, -0.06) }, // Solar
  { anchor: new THREE.Vector3(0.21, 0.70, -0.11), delta: new THREE.Vector3(0.15,  0.50, -0.40) }, // HGA
  { anchor: new THREE.Vector3(0.00, 0.42,  0.36), delta: new THREE.Vector3(0.00, -0.12,  0.60) }, // Arm
  { anchor: new THREE.Vector3(0.00, 0.35,  0.00), delta: new THREE.Vector3(0.00, -0.38,  0.00) }  // Mobility
];

export const CadGuideRails: React.FC<CadGuideRailsProps> = ({ explodedFactor }) => {
  const lines = useMemo(() => {
    return RAIL_ANCHORS.map((item) => {
      const p1 = item.anchor;
      const p2 = item.anchor.clone().add(item.delta.clone().multiplyScalar(explodedFactor));
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      return geo;
    });
  }, [explodedFactor]);

  if (explodedFactor <= 0.01) return null;

  return (
    <group>
      {lines.map((geo, idx) => (
        <line key={idx} geometry={geo}>
          <lineDashedMaterial
            color="#38bdf8"
            dashSize={0.05}
            gapSize={0.04}
            transparent
            opacity={explodedFactor * 0.75}
          />
        </line>
      ))}
    </group>
  );
};
