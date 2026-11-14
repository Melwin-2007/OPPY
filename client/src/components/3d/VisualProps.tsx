import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, Group, Mesh, DodecahedronGeometry, BufferGeometry, Vector3, BufferAttribute, AdditiveBlending } from 'three';

interface VisualPropsComponentProps {
  mode: 'idle' | 'drive' | 'scan' | 'sample' | 'comm';
  simSpeed?: number;
}

export const VisualProps: React.FC<VisualPropsComponentProps> = ({ mode, simSpeed = 1.0 }) => {
  const sparkPointsRef = useRef<Points>(null);
  const dustPointsRef = useRef<Points>(null);

  // 1. Martian Rock Outcrop Geometry
  const rockGeo = useMemo(() => {
    const geo = new DodecahedronGeometry(0.08, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const noise = 1.0 + Math.sin(vx * 25 + vy * 15 + vz * 20) * 0.14;
      pos.setXYZ(i, vx * noise, Math.max(0.005, vy * noise), vz * noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 2. RAT Spark Particles
  const sparkCount = 35;
  const { sparkGeo, sparkVels } = useMemo(() => {
    const geo = new BufferGeometry();
    const pos = new Float32Array(sparkCount * 3);
    const vels: Vector3[] = [];
    for (let i = 0; i < sparkCount; i++) {
      pos[i * 3 + 0] = 0.08;
      pos[i * 3 + 1] = 0.06;
      pos[i * 3 + 2] = 0.68;
      vels.push(new Vector3(
        (Math.random() - 0.5) * 0.35,
        Math.random() * 0.45 + 0.05,
        (Math.random() - 0.5) * 0.35
      ));
    }
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    return { sparkGeo: geo, sparkVels: vels };
  }, []);

  // 3. Ferric Dust Particles
  const dustCount = 80;
  const { dustGeo, dustLifes, dustSpawns } = useMemo(() => {
    const geo = new BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    const lifes = new Float32Array(dustCount);
    const spawns = [
      [-0.52, 0.02,  0.60], [ 0.52, 0.02,  0.60],
      [-0.52, 0.02, -0.06], [ 0.52, 0.02, -0.06],
      [-0.52, 0.02, -0.60], [ 0.52, 0.02, -0.60]
    ];
    for (let i = 0; i < dustCount; i++) {
      const sp = spawns[i % spawns.length];
      pos[i * 3 + 0] = sp[0] + (Math.random() - 0.5) * 0.08;
      pos[i * 3 + 1] = sp[1] + Math.random() * 0.04;
      pos[i * 3 + 2] = sp[2] + (Math.random() - 0.5) * 0.08;
      lifes[i] = Math.random();
    }
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    return { dustGeo: geo, dustLifes: lifes, dustSpawns: spawns };
  }, []);

  useFrame((_, delta) => {
    const dt = delta * simSpeed;

    // Animate Sparks (Sample Mode)
    if (mode === 'sample' && sparkPointsRef.current) {
      const pos = sparkPointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < sparkCount; i++) {
        const v = sparkVels[i];
        pos[i * 3 + 0] += v.x * dt;
        pos[i * 3 + 1] += v.y * dt;
        pos[i * 3 + 2] += v.z * dt;
        v.y -= dt * 0.98; // Mars Gravity
        if (pos[i * 3 + 1] < 0.04) {
          pos[i * 3 + 0] = 0.08 + (Math.random() - 0.5) * 0.02;
          pos[i * 3 + 1] = 0.055;
          pos[i * 3 + 2] = 0.68 + (Math.random() - 0.5) * 0.02;
          v.set((Math.random() - 0.5) * 0.35, Math.random() * 0.45 + 0.08, (Math.random() - 0.5) * 0.35);
        }
      }
      sparkPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate Dust (Drive Mode)
    if (mode === 'drive' && dustPointsRef.current) {
      const dpos = dustPointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        dustLifes[i] += dt * 1.2;
        dpos[i * 3 + 2] -= dt * 0.4;
        dpos[i * 3 + 1] += dt * 0.12;
        if (dustLifes[i] > 1.0) {
          const sp = dustSpawns[i % dustSpawns.length];
          dpos[i * 3 + 0] = sp[0] + (Math.random() - 0.5) * 0.08;
          dpos[i * 3 + 1] = sp[1] + Math.random() * 0.04;
          dpos[i * 3 + 2] = sp[2] + (Math.random() - 0.5) * 0.08;
          dustLifes[i] = 0.0;
        }
      }
      dustPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Martian Outcrop Rock & RAT Sparks */}
      <mesh geometry={rockGeo} position={[0.08, 0.04, 0.68]} castShadow receiveShadow>
        <meshStandardMaterial color="#693a2b" roughness={0.88} metalness={0.12} />
      </mesh>

      {/* Spark Emitter */}
      <points ref={sparkPointsRef} geometry={sparkGeo} visible={mode === 'sample'}>
        <pointsMaterial color="#facc15" size={0.035} transparent opacity={0.95} blending={AdditiveBlending} />
      </points>

      {/* Dust Particles */}
      <points ref={dustPointsRef} geometry={dustGeo} visible={mode === 'drive'}>
        <pointsMaterial color="#c86a3d" size={0.042} transparent opacity={0.65} />
      </points>

      {/* Wheel Tracks on Soil */}
      <mesh position={[-0.522, 0.0025, -1.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.16, 4.2]} />
        <meshBasicMaterial color="#421b12" transparent opacity={mode === 'drive' ? 0.45 : 0.25} depthWrite={false} />
      </mesh>
      <mesh position={[0.522, 0.0025, -1.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.16, 4.2]} />
        <meshBasicMaterial color="#421b12" transparent opacity={mode === 'drive' ? 0.45 : 0.25} depthWrite={false} />
      </mesh>
    </group>
  );
};
