/**
 * PodCraft 3D Experience - Main Orchestrator
 * Narrative-driven scroll experience inspired by Unseen Studio
 */

'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Html,
  ScrollControls,
  useScroll,
  Effects,
} from '@react-three/drei';
import {
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
  DepthOfField,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { DESIGN_TOKENS } from './designTokens';
import { createSM7BMicrophone, createSM7BSimplified } from './objects/MicrophoneSM7B';
import { createSpeakerAvatar, SPEAKER_PRESETS, animateSpeakerAvatar } from './objects/SpeakerAvatars';
import { createVisualizerBars } from './objects/AudioVisualizer';
import { createAtmosphereParticles, createFloatingOrbs, createLightRays, createStudioLighting, createEnvironment, createDustMotes } from './objects/Atmosphere';

gsap.registerPlugin(ScrollTrigger);

interface Experience3DProps {
  className?: string;
  style?: React.CSSProperties;
  onSectionChange?: (section: string, progress: number) => void;
}

export function Experience3D({ className, style, onSectionChange }: Experience3DProps) {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const sectionProgressRef = useRef<Record<string, number>>({});
  const currentSectionRef = useRef('hero');
  const scrollProgressRef = useRef(0);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const mobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const lowEnd = mobile || !gl || (navigator.hardwareConcurrency ?? 8) <= 4;
      setIsLowEnd(lowEnd);
      setWebGLSupported(!!gl);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // WebGL support check
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setWebGLSupported(!!gl);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  // Performance settings based on device
  const perfSettings = useMemo(() => {
    if (isLowEnd) return DESIGN_TOKENS.performance.lowEnd;
    if (isMobile) return DESIGN_TOKENS.performance.mobile;
    return DESIGN_TOKENS.performance.desktop;
  }, [isMobile, isLowEnd]);

  // Fallback UI
  if (!webGLSupported) {
    return (
      <div 
        className={className}
        style={{ ...style, width: '100%', height: '100%', minHeight: '600px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0B0F19', color: '#64748B' }}
        role="img"
        aria-label="3D experience requires WebGL"
      >
        <div className="text-center p-8">
          <svg className="w-24 h-24 mx-auto text-amber-500/50 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
          <p className="text-lg font-medium text-white mb-2">3D Experience</p>
          <p className="text-sm text-slate-500">Requires WebGL support</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={{ 
        ...style, 
        width: '100%', 
        height: '100%', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: DESIGN_TOKENS.camera.fov }}
        dpr={perfSettings.dpr}
        performance={{ min: perfSettings.postProcessing ? 0.5 : 0.3 }}
        gl={{ 
          antialias: !isLowEnd, 
          alpha: true, 
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
        }}
        shadows={!isLowEnd}
        onCreated={({ gl }) => {
          gl.setClearColor(0x0B0F19, 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <Suspense fallback={<Html center>Loading Studio…</Html>}>
          <ExperienceScene 
            perfSettings={perfSettings}
            onSectionChange={onSectionChange}
            sectionProgressRef={sectionProgressRef}
            currentSectionRef={currentSectionRef}
            scrollProgressRef={scrollProgressRef}
          />
        </Suspense>
        
        {/* Scroll-controlled camera */}
        <ScrollControls
          pages={4}
          distance={1}
          infinite={false}
          horizontal={false}
        >
          <ScrollCamera />
        </ScrollControls>
        
        {/* Post-processing - desktop only */}
        {perfSettings.postProcessing && (
          <Effects>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.025}
              height={0.5}
            />
            <Vignette intensity={0.35} smoothness={0.45} />
            <ChromaticAberration offset={[0.002, 0.002]} />
            <Noise opacity={0.02} />
            <DepthOfField
              focusDistance={4}
              focalLength={0.05}
              bokehScale={2}
            />
          </Effects>
        )}
      </Canvas>

      {/* Section markers for scroll sync */}
      <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', height: '400vh', width: '1px' }}>
        {['hero', 'features', 'speakers', 'cta'].map((section, i) => (
          <div
            key={section}
            data-scroll-section={section}
            style={{
              position: 'absolute',
              top: `${i * 25}%`,
              height: '25%',
              width: '1px',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============ MAIN SCENE ============

function ExperienceScene({
  perfSettings,
  onSectionChange,
  sectionProgressRef,
  currentSectionRef,
  scrollProgressRef,
}: {
  perfSettings: { maxParticles: number; dpr: number; postProcessing: boolean };
  onSectionChange?: (section: string, progress: number) => void;
  sectionProgressRef: React.MutableRefObject<Record<string, number>>;
  currentSectionRef: React.MutableRefObject<string>;
  scrollProgressRef: React.MutableRefObject<number>;
}) {
  const { scene, camera } = useThree();
  const scroll = useScroll();
  const timeRef = useRef(0);
  const micRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const orbsRef = useRef<THREE.Group | null>(null);
  const lightRaysRef = useRef<THREE.Group | null>(null);
  const visualizerRef = useRef<THREE.Group | null>(null);
  const speakerAvatarsRef = useRef<THREE.Group[]>([]);
  const initializedRef = useRef(false);

  // Initialize scene
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Environment
    const env = createEnvironment();
    scene.add(env);

    // Lighting
    const lights = createStudioLighting();
    scene.add(lights);

    // Atmosphere particles
    const particles = createAtmosphereParticles(perfSettings.maxParticles);
    particlesRef.current = particles;
    scene.add(particles);

    // Floating orbs
    const orbs = createFloatingOrbs(perfSettings.maxParticles > 1000 ? 6 : 3);
    orbsRef.current = orbs;
    scene.add(orbs);

    // Light rays
    const rays = createLightRays(8);
    lightRaysRef.current = rays;
    scene.add(rays);

    // Dust motes
    const dust = createDustMotes(200);
    scene.add(dust);

    // Visualizer bars
    const visualizer = createVisualizerBars(32);
    visualizerRef.current = visualizer;
    visualizer.position.set(0, -1.5, 1.2);
    scene.add(visualizer);

    // Microphone - use simplified version for low-end
    const mic = perfSettings.maxParticles < 500 ? createSM7BSimplified() : createSM7BMicrophone();
    micRef.current = mic;
    mic.position.set(0, 1.2, 0);
    scene.add(mic);

    // Speaker avatars
    const avatars = SPEAKER_PRESETS.map((preset, i) => {
      const avatar = createSpeakerAvatar(preset);
      avatar.position.set(
        (i - 2) * 2.2,
        0.3,
        2.5
      );
      avatar.scale.setScalar(0.7);
      return avatar;
    });
    speakerAvatarsRef.current = avatars;
    
    const avatarGroup = new THREE.Group();
    avatarGroup.name = 'speakerAvatars';
    avatars.forEach(a => avatarGroup.add(a));
    avatarGroup.position.set(0, -0.5, 3);
    scene.add(avatarGroup);

    // Contact shadow for mic
    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 32),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, -0.02, 0);
    scene.add(contactShadow);

    // Cleanup
    return () => {
      scene.remove(env, lights, particles, orbs, rays, dust, visualizer, mic, avatarGroup);
      [particles, orbs, rays, dust, visualizer, mic, avatarGroup].forEach(obj => {
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      });
    };
  }, [perfSettings.maxParticles]);

  // Scroll progress tracking
  useFrame((state, delta) => {
    timeRef.current += delta;
    const progress = scroll.offset;
    scrollProgressRef.current = progress;

    // Update particle uniforms
    if (particlesRef.current?.material && 'uniforms' in particlesRef.current.material) {
      const mat = particlesRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = timeRef.current;
      mat.uniforms.uScrollProgress.value = progress;
      particlesRef.current.rotation.y += 0.0001 * perfSettings.maxParticles / 2000;
      particlesRef.current.rotation.x = Math.sin(timeRef.current * 0.1) * 0.02;
    }

    // Animate orbs
    if (orbsRef.current) {
      orbsRef.current.children.forEach((orb) => {
        const ud = orb.userData as { basePosition: THREE.Vector3; speed: number; phase: number; rotationSpeed?: number } | undefined;
        if (ud) {
          orb.position.x = ud.basePosition.x + Math.sin(timeRef.current * ud.speed + ud.phase) * 0.5;
          orb.position.y = ud.basePosition.y + Math.cos(timeRef.current * ud.speed * 0.7 + ud.phase) * 0.3;
          orb.position.z = ud.basePosition.z + Math.sin(timeRef.current * ud.speed * 0.5 + ud.phase) * 0.5;
          orb.rotation.y += ud.rotationSpeed ?? 0;
        }
      });
    }

    // Animate light rays
    if (lightRaysRef.current) {
      lightRaysRef.current.children.forEach((ray) => {
        const ud = ray.userData as { baseRotation: number; speed: number } | undefined;
        if (ud) {
          ray.rotation.z = ud.baseRotation + Math.sin(timeRef.current * ud.speed) * 0.1;
          if ('material' in ray) {
            const mat = (ray as THREE.Mesh).material as THREE.MeshBasicMaterial;
            mat.opacity = 0.02 + Math.sin(timeRef.current * 0.5) * 0.01;
          }
        }
      });
    }

    // Animate microphone
    if (micRef.current) {
      const mic = micRef.current;
      mic.rotation.y = progress * Math.PI * 2;
      mic.rotation.x = Math.sin(timeRef.current * 0.5) * 0.03;
      mic.position.y = 1.2 + Math.sin(timeRef.current * 0.8) * 0.02;
      
      // Grille breathing
      const grille = mic.getObjectByName('grille');
      if (grille) {
        grille.position.y = 0.22 + Math.sin(timeRef.current * 1.5) * 0.002;
      }
    }

    // Animate visualizer
    if (visualizerRef.current) {
      visualizerRef.current.children.forEach((bar, i) => {
        if ('material' in bar) {
          const mesh = bar as THREE.Mesh;
          if (mesh.material) {
            const freq = Math.sin(timeRef.current * 2 + i * 0.3) * 0.5 + 0.5;
            const targetScale = 0.15 + freq * 2.5;
            bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetScale, 0.15);
            
            const hue = 0.1 + (1 - i / 32) * 0.6;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.color.setHSL(hue, 0.8, 0.5);
            mat.emissive.setHSL(hue, 0.8, 0.3);
            mat.emissiveIntensity = Math.sin(timeRef.current * 3 + i) * 0.3 + 0.5;
          }
        }
      });
    }

    // Animate speaker avatars
    speakerAvatarsRef.current.forEach((avatar) => {
      const scrollSectionProgress = sectionProgressRef.current.speakers || 0;
      const isHovered = false;
      animateSpeakerAvatar(avatar, state.clock.getElapsedTime(), scrollSectionProgress, isHovered);
    });

    // Section change detection
    const sections = ['hero', 'features', 'speakers', 'cta'];
    sections.forEach((section, i) => {
      const sectionProgress = scroll.offset - i * 0.25;
      const clamped = THREE.MathUtils.clamp(sectionProgress / 0.25, 0, 1);
      sectionProgressRef.current[section] = clamped;
      
      if (clamped > 0.5 && currentSectionRef.current !== section) {
        currentSectionRef.current = section;
        onSectionChange?.(section, clamped);
      }
    });

    // Parallax camera movement
    const parallaxX = Math.sin(progress * Math.PI * 2) * 0.5;
    const parallaxY = Math.cos(progress * Math.PI) * 0.3;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, parallaxX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.5 + parallaxY, 0.05);
    camera.lookAt(0, 1.2, 0);
  });

  return null;
}

// ============ SCROLL CAMERA ============

function ScrollCamera() {
  const scroll = useScroll();
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useFrame(() => {
    if (!cameraRef.current) return;
    const progress = scroll.offset;

    // Cinematic camera path
    const radius = 4;
    const height = 1.5 + Math.sin(progress * Math.PI) * 0.5;
    const angle = progress * Math.PI * 2 + Math.sin(progress * Math.PI * 4) * 0.1;

    cameraRef.current.position.set(
      Math.sin(angle) * radius,
      height,
      Math.cos(angle) * radius
    );
    cameraRef.current.lookAt(0, 1.2, 0);
    
    // Dynamic FOV for emphasis
    cameraRef.current.fov = THREE.MathUtils.lerp(45, 55, Math.sin(progress * Math.PI));
    cameraRef.current.updateProjectionMatrix();
  });

  return <perspectiveCamera ref={cameraRef} position={[4, 1.5, 4]} fov={45} />;
}

// Named export already on function declaration above