'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Html,
  OrbitControls,
  useScroll,
  Environment,
  ScrollControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useEffect as useEffectReact } from 'react';

const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent);

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

function Microphone() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const grilleRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const progress = scroll?.offset ?? 0;

    if (groupRef.current) {
      groupRef.current.rotation.y = progress * Math.PI * 2;
      groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.03;
    }

    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 2) * 0.01;
    }

    if (grilleRef.current) {
      grilleRef.current.position.y = Math.sin(t * 3) * 0.005;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={0.8}>
      <Environment preset="studio" intensity={1.2} background />

      <primitive
        ref={bodyRef}
        object={createMicrophoneBody()}
        position={[0, 1.2, 0]}
      />
      <primitive
        ref={grilleRef}
        object={createGrille()}
        position={[0, 2.1, 0]}
      />
      <primitive object={createStand()} position={[0, 0, 0]} />
      <primitive object={createCable()} position={[0, -0.5, 0]} />
    </group>
  );
}

function createMicrophoneBody() {
  const bodyGroup = new THREE.Group();

  const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.28, 1.8, 32, 1, true);
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0B0F19,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    reflectivity: 1,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  bodyGroup.add(body);

  const ringGeometry = new THREE.TorusGeometry(0.29, 0.02, 16, 32);
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xF59E0B,
    metalness: 1,
    roughness: 0.1,
  });
  const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
  topRing.position.y = 0.9;
  topRing.rotation.x = Math.PI / 2;
  bodyGroup.add(topRing);

  const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
  bottomRing.position.y = -0.9;
  bottomRing.rotation.x = Math.PI / 2;
  bodyGroup.add(bottomRing);

  const brandGeo = new THREE.RingGeometry(0.08, 0.15, 32);
  const brandMat = new THREE.MeshBasicMaterial({
    color: 0xF59E0B,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const brand = new THREE.Mesh(brandGeo, brandMat);
  brand.position.set(0, 0, 0.285);
  brand.rotation.x = -Math.PI / 2;
  bodyGroup.add(brand);

  return bodyGroup;
}

function createGrille() {
  const grilleGroup = new THREE.Group();

  const capGeometry = new THREE.SphereGeometry(0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const grilleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e,
    metalness: 0.8,
    roughness: 0.3,
  });
  const cap = new THREE.Mesh(capGeometry, grilleMaterial);
  cap.castShadow = true;
  grilleGroup.add(cap);

  const holesGeo = new THREE.SphereGeometry(0.315, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const holesMat = new THREE.MeshBasicMaterial({
    color: 0x0a0a15,
    transparent: true,
    opacity: 0.8,
    side: THREE.BackSide,
  });
  const holes = new THREE.Mesh(holesGeo, holesMat);
  grilleGroup.add(holes);

  const topCapGeometry = new THREE.CircleGeometry(0.32, 32);
  const topCapMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e,
    metalness: 0.9,
    roughness: 0.2,
    side: THREE.DoubleSide,
  });
  const topCap = new THREE.Mesh(topCapGeometry, topCapMaterial);
  topCap.rotation.x = -Math.PI / 2;
  topCap.position.y = 0.01;
  grilleGroup.add(topCap);

  const rimGeometry = new THREE.TorusGeometry(0.32, 0.015, 16, 32);
  const rimMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xF59E0B,
    metalness: 1,
    roughness: 0.05,
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = Math.PI / 2;
  grilleGroup.add(rim);

  return grilleGroup;
}

function createStand() {
  const standGroup = new THREE.Group();

  const baseGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.15, 32);
  const baseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0B0F19,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.075;
  base.castShadow = true;
  base.receiveShadow = true;
  standGroup.add(base);

  const poleGeometry = new THREE.CylinderGeometry(0.025, 0.03, 1.5, 16);
  const poleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a3e,
    metalness: 0.8,
    roughness: 0.2,
  });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 0.825;
  pole.castShadow = true;
  standGroup.add(pole);

  const jointGeometry = new THREE.SphereGeometry(0.04, 16, 16);
  const jointMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xF59E0B,
    metalness: 1,
    roughness: 0.1,
  });
  const joint = new THREE.Mesh(jointGeometry, jointMaterial);
  joint.position.y = 1.575;
  standGroup.add(joint);

  const boomGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 16);
  const boom = new THREE.Mesh(boomGeometry, poleMaterial);
  boom.position.set(0.4, 1.975, 0);
  boom.rotation.z = -Math.PI / 2;
  boom.castShadow = true;
  standGroup.add(boom);

  return standGroup;
}

function createCable() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.4, 1.975, 0),
    new THREE.Vector3(0.4, 1.5, 0),
    new THREE.Vector3(0.2, 0.5, 0.2),
    new THREE.Vector3(0, 0, 0.3),
    new THREE.Vector3(-0.2, -0.5, 0.1),
    new THREE.Vector3(-0.3, -1.2, 0),
  ]);

  const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.015, 8, false);
  const cableMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e,
    metalness: 0.1,
    roughness: 0.9,
  });
  const cable = new THREE.Mesh(tubeGeometry, cableMaterial);
  cable.castShadow = true;

  return cable;
}

function AudioVisualizer() {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffectReact(() => {
    if (typeof window === 'undefined' || !window.AudioContext) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    audioCtxRef.current = audioCtx;

    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    audio.loop = true;
    audio.muted = true;

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audio.play().catch(() => {});

    return () => {
      audioCtx.close();
    };
  }, []);

  useFrame(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    barsRef.current.forEach((bar, i) => {
      const value = dataArray[i] / 255;
      const targetScale = 0.1 + value * 2;
      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetScale, 0.15);
      bar.material.color.setHSL(0.1 + value * 0.6, 0.8, 0.5);
    });
  });

  return (
    <group position={[0, -1.5, 1.2]}>
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) barsRef.current[i] = el; }}
          position={[(i - 7.5) * 0.18, 0, 0]}
          geometry={new THREE.BoxGeometry(0.12, 0.1, 0.12)}
        >
          <meshStandardMaterial color={0xF59E0B} emissive={0xF59E0B} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ScrollControlledCamera() {
  const scroll = useScroll();
  const ref = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (!ref.current) return;

    const progress = scroll?.offset ?? 0;
    const radius = 3.5;
    const height = 1.5 + progress * 0.5;
    const angle = progress * Math.PI * 2;

    ref.current.position.set(
      Math.sin(angle) * radius,
      height,
      Math.cos(angle) * radius
    );
    ref.current.lookAt(0, 1, 0);
  });

  return <camera ref={ref} position={[3.5, 1.5, 3.5]} fov={45} />;
}

function MicrophoneScene({ scrollControlled = false }: { scrollControlled?: boolean }) {
  return (
    <>
      <Microphone />
      <AudioVisualizer />
      {scrollControlled && <ScrollControlledCamera />}
    </>
  );
}

function CanvasWrapper({ 
  children, 
  scrollControlled = false, 
  className = '',
  style = {}
}: { 
  children: React.ReactNode; 
  scrollControlled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setWebGLSupported(checkWebGLSupport());
  }, []);

  if (!webGLSupported || hasError) {
    return (
      <div 
        className={className}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'var(--muted-foreground)' }}
        role="img"
        aria-label="3D microphone preview - requires WebGL"
      >
        <div className="text-center p-8">
          <svg className="w-24 h-24 mx-auto text-primary/50 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
          <p className="text-lg font-medium">3D Preview Unavailable</p>
          <p className="text-sm text-muted-foreground mt-1">Your browser doesn't support WebGL</p>
        </div>
      </div>
    );
  }

  const canvasContent = (
    <Canvas
      camera={{ position: [3.5, 1.5, 3.5], fov: 45 }}
      dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
      performance={{ min: isMobile ? 0.4 : 0.6 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      shadows
      onCreated={({ gl }) => {
        gl.setClearColor(0x0B0F19, 0);
      }}
    >
      <Suspense fallback={<Html center>Loading 3D...</Html>}>
        <MicrophoneScene scrollControlled={scrollControlled} />
      </Suspense>
      {scrollControlled ? (
        <>
          <ScrollControls pages={3} distance={1} infinite horizontal={false}>
            <ScrollControlledCamera />
          </ScrollControls>
        </>
      ) : (
        <OrbitControls
          enableZoom={!isMobile}
          enablePan={false}
          minDistance={2}
          maxDistance={6}
          autoRotate={isMobile}
          autoRotateSpeed={0.5}
        />
      )}
    </Canvas>
  );

  return (
    <div 
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '500px', ...style }}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      {canvasContent}
    </div>
  );
}

export function MicrophoneCanvas({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <CanvasWrapper className={className} style={style} scrollControlled={false} />;
}

export function ScrollMicrophoneCanvas({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <CanvasWrapper className={className} style={style} scrollControlled={true} />;
}