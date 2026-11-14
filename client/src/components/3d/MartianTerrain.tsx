import React, { useMemo } from 'react';
import * as THREE from 'three';

export const MartianTerrain: React.FC = () => {
  // Ground Contact Shadow Canvas Texture
  const shadowTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
    grad.addColorStop(0.0, 'rgba(0,0,0,0.75)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  // Polar Range Reticles (0.8m, 1.6m, 2.4m, 3.2m)
  const rings = useMemo(() => {
    const radii = [0.8, 1.6, 2.4, 3.2];
    return radii.map((r) => {
      const pts: THREE.Vector3[] = [];
      const segs = 64;
      for (let j = 0; j <= segs; j++) {
        const theta = (j / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * r, 0.002, Math.sin(theta) * r));
      }
      return new THREE.BufferGeometry().setFromPoints(pts);
    });
  }, []);

  return (
    <group>
      {/* Ground Contact Shadow Disc */}
      <mesh position={[0, 0.001, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.2]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.85} depthWrite={false} />
      </mesh>

      {/* Grid Floor */}
      <gridHelper args={[6, 18, '#4b5058', '#22252a']} position={[0, 0, 0]} />

      {/* Polar Range Lines */}
      {rings.map((geo, idx) => (
        <line key={idx} geometry={geo}>
          <lineBasicMaterial color={idx === 1 ? '#38bdf8' : '#3d434d'} transparent opacity={idx === 1 ? 0.7 : 0.4} />
        </line>
      ))}
    </group>
  );
};
