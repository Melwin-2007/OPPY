import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Object3D, Vector3, Mesh, MeshStandardMaterial } from 'three';
import { injectWheelRotationShader } from '../../shaders/wheelShader';

interface RoverModelProps {
  explodedFactor?: number;
  selectedSubsystem?: string | null;
  mode?: 'idle' | 'drive' | 'scan' | 'sample' | 'comm';
  simSpeed?: number;
  isWireframe?: boolean;
}

export const RoverModel: React.FC<RoverModelProps> = ({
  explodedFactor = 0.0,
  mode = 'idle',
  simSpeed = 1.0,
  isWireframe = false
}) => {
  const { scene: gltfScene } = useGLTF('/models/24883_MER_static.glb');
  const roverGroupRef = useRef<Group>(null);

  const wheelUniforms = useMemo(() => ({ uWheelAngle: { value: 0.0 } }), []);

  // Set up model hierarchy, pivots, and wheel rotation shader
  const { mastGroup, armGroup, antennaGroup, explodedMap } = useMemo(() => {
    const cloned = gltfScene.clone(true);

    const mast = new Group();
    mast.position.set(-0.020, 0.713, 0.356);

    const arm = new Group();
    arm.position.set(0.104, 0.464, 0.423);

    const antenna = new Group();
    antenna.position.set(0.387, 0.814, -0.236);

    const expMap = new Map<string, { mesh: Object3D; basePos: Vector3; delta: Vector3 }>();

    // Collect meshes
    const meshes: Mesh[] = [];
    cloned.traverse((child: Object3D) => {
      const m = child as Mesh;
      if (m.isMesh) meshes.push(m);
    });

    meshes.forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const mat = mesh.material as MeshStandardMaterial;
      if (!mat) return;

      mat.envMapIntensity = 1.3;
      mat.roughness = Math.max(0.18, mat.roughness);

      const name = (mat.name || '').toLowerCase();

      if (name.includes('mast') || name.includes('foil')) {
        mesh.position.set(0.020, -0.713, -0.356);
        mast.add(mesh);
      } else if (name.includes('arm')) {
        mesh.position.set(-0.104, -0.464, -0.423);
        arm.add(mesh);
      } else if (name.includes('silver')) {
        mesh.position.set(-0.387, -0.814, 0.236);
        antenna.add(mesh);
      } else if (name.includes('suspension')) {
        injectWheelRotationShader(mat, wheelUniforms);
        expMap.set('mobility', {
          mesh,
          basePos: mesh.position.clone(),
          delta: new Vector3(0.0, -0.38, 0.0)
        });
      } else if (name.includes('panels')) {
        expMap.set('power', {
          mesh,
          basePos: mesh.position.clone(),
          delta: new Vector3(0.0, 0.42, -0.06)
        });
      } else if (name.includes('instruments')) {
        expMap.set('antenna_aux', {
          mesh,
          basePos: mesh.position.clone(),
          delta: new Vector3(0.15, 0.50, -0.40)
        });
      } else {
        expMap.set('avionics', {
          mesh,
          basePos: mesh.position.clone(),
          delta: new Vector3(0.0, 0.0, 0.0)
        });
      }
    });

    cloned.add(mast);
    cloned.add(arm);
    cloned.add(antenna);

    expMap.set('mast', {
      mesh: mast,
      basePos: mast.position.clone(),
      delta: new Vector3(0.0, 0.80, 0.18)
    });
    expMap.set('arm', {
      mesh: arm,
      basePos: arm.position.clone(),
      delta: new Vector3(0.0, -0.12, 0.60)
    });
    expMap.set('antenna', {
      mesh: antenna,
      basePos: antenna.position.clone(),
      delta: new Vector3(0.15, 0.50, -0.40)
    });

    return { clonedScene: cloned, mastGroup: mast, armGroup: arm, antennaGroup: antenna, explodedMap: expMap };
  }, [gltfScene, wheelUniforms]);

  // Update wireframe state
  useEffect(() => {
    if (roverGroupRef.current) {
      roverGroupRef.current.traverse((child: Object3D) => {
        const m = child as Mesh;
        if (m.isMesh && m.material) {
          const mat = m.material as MeshStandardMaterial;
          mat.wireframe = isWireframe;
        }
      });
    }
  }, [isWireframe]);

  // Update exploded view factor
  useEffect(() => {
    explodedMap.forEach((entry) => {
      entry.mesh.position.set(
        entry.basePos.x + entry.delta.x * explodedFactor,
        entry.basePos.y + entry.delta.y * explodedFactor,
        entry.basePos.z + entry.delta.z * explodedFactor
      );
    });
  }, [explodedFactor, explodedMap]);

  // Animation Update Frame Loop
  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * simSpeed;
    const dt = delta * simSpeed;

    if (mode === 'drive') {
      wheelUniforms.uWheelAngle.value += dt * 3.8;
      if (roverGroupRef.current) {
        roverGroupRef.current.rotation.x = Math.sin(t * 2.8) * 0.024 + Math.cos(t * 1.5) * 0.012;
        roverGroupRef.current.rotation.z = Math.cos(t * 2.0) * 0.018 + Math.sin(t * 3.2) * 0.008;
        roverGroupRef.current.position.y = 0.0026 + Math.sin(t * 5.6) * 0.005;
      }
      mastGroup.rotation.set(0, 0, 0);
      armGroup.rotation.set(0, 0, 0);
      antennaGroup.rotation.set(0, 0, 0);
    } else if (mode === 'scan') {
      if (roverGroupRef.current) {
        roverGroupRef.current.rotation.set(0, 0, 0);
        roverGroupRef.current.position.y = 0.0026;
      }
      const panAz = Math.sin(t * 0.8) * 1.45;
      const tiltEl = -0.16 + Math.sin(t * 1.6) * 0.15;
      mastGroup.rotation.y = panAz;
      mastGroup.rotation.x = tiltEl;
      armGroup.rotation.set(0, 0, 0);
      antennaGroup.rotation.set(0, 0, 0);
    } else if (mode === 'sample') {
      if (roverGroupRef.current) {
        roverGroupRef.current.rotation.set(0, 0, 0);
        roverGroupRef.current.position.y = 0.0026;
      }
      mastGroup.rotation.set(-0.32, 0.12, 0);
      armGroup.rotation.x = -1.02 + Math.sin(t * 1.8) * 0.05;
      armGroup.rotation.y = -0.28 + Math.cos(t * 1.4) * 0.03;
      armGroup.rotation.z = 0.16;
      antennaGroup.rotation.set(0, 0, 0);
    } else if (mode === 'comm') {
      if (roverGroupRef.current) {
        roverGroupRef.current.rotation.set(0, 0, 0);
        roverGroupRef.current.position.y = 0.0026;
      }
      mastGroup.rotation.set(0, 0, 0);
      armGroup.rotation.set(0, 0, 0);
      antennaGroup.rotation.y = 0.38 + Math.sin(t * 0.4) * 0.12;
      antennaGroup.rotation.x = -0.74 + Math.cos(t * 0.3) * 0.06;
    } else {
      if (roverGroupRef.current) {
        roverGroupRef.current.rotation.set(0, 0, 0);
        roverGroupRef.current.position.y = 0.0026;
      }
      mastGroup.rotation.set(0, 0, 0);
      armGroup.rotation.set(0, 0, 0);
      antennaGroup.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={roverGroupRef} position={[0.0, 0.0026, 0.0869]}>
      <primitive object={gltfScene} />
    </group>
  );
};

useGLTF.preload('/models/24883_MER_static.glb');
