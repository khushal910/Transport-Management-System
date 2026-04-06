import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

// 3D Object Component - Animated Sphere
function AnimatedSphere({
  position,
  color,
  scrollProgress,
}: {
  position: [number, number, number];
  color: string;
  scrollProgress: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
      meshRef.current.position.y = position[1] + Math.sin(scrollProgress * 0.1) * 0.5;
      meshRef.current.scale.x = 1 + Math.sin(scrollProgress * 0.05) * 0.2;
      meshRef.current.scale.y = 1 + Math.sin(scrollProgress * 0.05) * 0.2;
      meshRef.current.scale.z = 1 + Math.sin(scrollProgress * 0.05) * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
      <meshPhongMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.3}
        shininess={100}
      />
    </Sphere>
  );
}

// 3D Object Component - Animated Box
function AnimatedBox({
  position,
  color,
  scrollProgress,
}: {
  position: [number, number, number];
  color: string;
  scrollProgress: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.004;
      meshRef.current.rotation.z += 0.002;
      meshRef.current.position.z = position[2] + Math.cos(scrollProgress * 0.08) * 0.3;
    }
  });

  return (
    <Box ref={meshRef} args={[1.2, 1.2, 1.2]} position={position}>
      <meshPhongMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.2}
        shininess={100}
        wireframe={false}
      />
    </Box>
  );
}

// Scene Content
function Scene({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.z = 8;
  }, [camera]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />
      <pointLight position={[0, 5, 10]} intensity={0.7} color="#06b6d4" />

      {/* 3D Objects - Blue Theme */}
      <AnimatedSphere
        position={[-4, 2, 0]}
        color="#3b82f6"
        scrollProgress={scrollProgress}
      />
      <AnimatedSphere
        position={[4, -1, -1]}
        color="#1d4ed8"
        scrollProgress={scrollProgress}
      />
      <AnimatedBox
        position={[0, 0, 0]}
        color="#7c3aed"
        scrollProgress={scrollProgress}
      />
      <AnimatedSphere
        position={[0, 3, -2]}
        color="#06b6d4"
        scrollProgress={scrollProgress}
      />
      <AnimatedBox
        position={[-5, -2, 1]}
        color="#6366f1"
        scrollProgress={scrollProgress}
      />
      <AnimatedSphere
        position={[3, -3, 2]}
        color="#8b5cf6"
        scrollProgress={scrollProgress}
      />

      {/* Floating particles effect */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 5 - 2.5]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshPhongMaterial 
            color={i % 2 === 0 ? '#3b82f6' : '#7c3aed'}
            emissive={i % 2 === 0 ? '#3b82f6' : '#7c3aed'}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

// Main Component
export function ScrollAnimation3D() {
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / maxScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 -z-20 w-full h-screen pointer-events-none bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ alpha: true, antialias: true, precision: 'highp', physicallyCorrectLights: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}

export default ScrollAnimation3D;
