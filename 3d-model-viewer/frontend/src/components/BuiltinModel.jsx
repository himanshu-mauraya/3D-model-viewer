import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const WireframeCube = ({ materialType = 'standard' }) => {
  const ref = useRef();
  const material = useMemo(() => createMaterial(materialType), [materialType]);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.6;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2.5, 2.5, 2.5]} />
      <primitive object={material} />
    </mesh>
  );
};

const SampleShapes = ({ materialType = 'standard' }) => {
  const r = useRef();
  const boxMaterial = useMemo(() => createMaterial(materialType, 0xE2E8F0), [materialType]);
  const sphereMaterial = useMemo(() => createMaterial(materialType, 0x06B6D4), [materialType]);

  useFrame((s) => {
    if (r.current) r.current.rotation.y = s.clock.elapsedTime * 0.4;
  });

  return (
    <group ref={r}>
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <primitive object={boxMaterial} />
      </mesh>
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <primitive object={sphereMaterial} />
      </mesh>
    </group>
  );
};

function createMaterial(materialType, color = 0xE2E8F0) {
  const baseColor = new THREE.Color(color);

  switch (materialType) {
    case 'wireframe':
      return new THREE.MeshBasicMaterial({ wireframe: true, color: 0x4A90E2, emissive: new THREE.Color(0x4A90E2), emissiveIntensity: 0.6 });
    
    case 'metallic':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: 1.0,
        roughness: 0.2,
        envMapIntensity: 1.0
      });
    
    case 'neon':
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x00D9FF),
        emissive: new THREE.Color(0x00D9FF),
        emissiveIntensity: 0.8
      });
    
    case 'crystal':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: 0,
        roughness: 0.1,
        transmission: 0.8,
        thickness: 2.0,
        ior: 2.0,
        clearcoat: 1.0,
        envMapIntensity: 1.0
      });
    
    case 'glass':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.7,
        metalness: 0,
        roughness: 0.05,
        transmission: 0.9,
        thickness: 1.0,
        ior: 1.5,
        envMapIntensity: 1.0
      });
    
    case 'toon':
      return new THREE.MeshToonMaterial({
        color: baseColor,
        flatShading: true
      });
    
    case 'standard':
    default:
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.3,
        roughness: 0.6
      });
  }
}

export default function BuiltinModel({ type = 'wireframeLogo', materialType = 'standard' }) {
  return (
    <>
      {type === 'wireframeLogo' && <WireframeCube materialType={materialType} />}
      {type === 'sampleShapes' && <SampleShapes materialType={materialType} />}
    </>
  );
}

