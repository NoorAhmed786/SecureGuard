"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const Atmosphere = () => {
  return (
    <Sphere args={[2.7, 64, 64]}>
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

const ScanRing = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.rotation.x += 0.005;
    }
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[3, 0.01, 16, 100]} />
      <meshBasicMaterial color="#0ea5e9" transparent opacity={0.3} />
    </mesh>
  );
}

const Globe = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#020617", // Slate 950
    emissive: "#1e40af", // Blue 800
    emissiveIntensity: 0.5,
    wireframe: true,
  }), []);

  return (
    <Sphere args={[2.5, 64, 64]} ref={meshRef}>
      <primitive object={material} attach="material" />
    </Sphere>
  );
};

const ThreatMarker = ({ position, color }: { position: [number, number, number], color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.scale.setScalar(1 + Math.sin(t * 5) * 0.3);
    }
  })
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <pointLight distance={1} intensity={2} color={color} />
    </group>
  )
}

export default function ThreeGlobe() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#1e40af" />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        <group rotation={[0, 0, 0.2]}>
          <Globe />
          <Atmosphere />
          <ScanRing />

          <ThreatMarker position={[1.8, 1.2, 1.5]} color="#ef4444" />
          <ThreatMarker position={[-1.5, -0.5, 2.0]} color="#f97316" />
          <ThreatMarker position={[0.5, -2.1, 1.2]} color="#ef4444" />
          <ThreatMarker position={[-2.2, 0.8, -0.5]} color="#3b82f6" />
        </group>

        <EffectComposer enableNormalPass>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 pointer-events-none" />
    </div>
  );
}
