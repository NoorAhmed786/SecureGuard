"use client";

import React, { useRef, useMemo, useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
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

// Fallback component when WebGL fails
const GlobeFallback = () => {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-blue-500/30 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-blue-400/20 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 pointer-events-none" />
    </div>
  );
};

// Error boundary to catch WebGL errors
class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress WebGL errors in console
    if (error.message.includes('WebGL')) {
      console.log('WebGL not available, using fallback visualization');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function ThreeGlobeContent() {
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    // Check if WebGL is available
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGLError(true);
      }
    } catch (e) {
      setHasWebGLError(true);
    }
  }, []);

  // Use fallback if WebGL error detected
  if (hasWebGLError) {
    return <GlobeFallback />;
  }

  return (
    <div className="w-full h-full absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 40 }}
        onCreated={(state) => {
          // Handle context loss
          state.gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            setHasWebGLError(true);
          });
        }}
      >
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

export default function ThreeGlobe() {
  return (
    <WebGLErrorBoundary fallback={<GlobeFallback />}>
      <ThreeGlobeContent />
    </WebGLErrorBoundary>
  );
}
