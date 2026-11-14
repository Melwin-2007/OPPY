import React, { useMemo } from 'react';
import { Vector3, BufferGeometry, Line, LineDashedMaterial } from 'three';

interface CadGuideRailsProps {
  explodedFactor: number;
}

const RAIL_ANCHORS = [
  { anchor: new Vector3(0.00, 0.68,  0.37), delta: new Vector3(0.00,  0.80,  0.18) }, // Mast
  { anchor: new Vector3(0.00, 0.67, -0.12), delta: new Vector3(0.00,  0.42, -0.06) }, // Solar
  { anchor: new Vector3(0.21, 0.70, -0.11), delta: new Vector3(0.15,  0.50, -0.40) }, // HGA
  { anchor: new Vector3(0.00, 0.42,  0.36), delta: new Vector3(0.00, -0.12,  0.60) }, // Arm
  { anchor: new Vector3(0.00, 0.35,  0.00), delta: new Vector3(0.00, -0.38,  0.00) }  // Mobility
];

export const CadGuideRails: React.FC<CadGuideRailsProps> = ({ explodedFactor }) => {
  const lineObjects = useMemo(() => {
    return RAIL_ANCHORS.map((item) => {
      const p1 = item.anchor;
      const p2 = item.anchor.clone().add(item.delta.clone().multiplyScalar(explodedFactor));
      const geo = new BufferGeometry().setFromPoints([p1, p2]);
      const mat = new LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.05,
        gapSize: 0.04,
        transparent: true,
        opacity: explodedFactor * 0.75
      });
      const line = new Line(geo, mat);
      line.computeLineDistances();
      return line;
    });
  }, [explodedFactor]);

  if (explodedFactor <= 0.01) return null;

  return (
    <group>
      {lineObjects.map((lineObj, idx) => (
        <primitive key={idx} object={lineObj} />
      ))}
    </group>
  );
};
