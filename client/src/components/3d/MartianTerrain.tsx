import React, { useMemo } from 'react';
import { CanvasTexture, Vector3, BufferGeometry, Line, LineBasicMaterial } from 'three';

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
    return new CanvasTexture(canvas);
  }, []);

  // Polar Range Reticles (0.8m, 1.6m, 2.4m, 3.2m)
  const ringLines = useMemo(() => {
    const radii = [0.8, 1.6, 2.4, 3.2];
    return radii.map((r, idx) => {
      const pts: Vector3[] = [];
      const segs = 64;
      for (let j = 0; j <= segs; j++) {
        const theta = (j / segs) * Math.PI * 2;
        pts.push(new Vector3(Math.cos(theta) * r, 0.002, Math.sin(theta) * r));
      }
      const geo = new BufferGeometry().setFromPoints(pts);
      const mat = new LineBasicMaterial({
        color: idx === 1 ? 0x38bdf8 : 0x3d434d,
        transparent: true,
        opacity: idx === 1 ? 0.7 : 0.4
      });
      return new Line(geo, mat);
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
      {ringLines.map((lineObj, idx) => (
        <primitive key={idx} object={lineObj} />
      ))}
    </group>
  );
};
