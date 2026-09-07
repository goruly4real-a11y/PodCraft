/**
 * Features Section 3D - The Signal Chain
 * Scroll through the podcast creation pipeline with 3D visualizations
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Html } from '@react-three/drei';

gsap.registerPlugin(ScrollTrigger);

interface FeatureStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: number;
  position: [number, number, number];
}

const FEATURES: FeatureStep[] = [
  {
    id: 'write',
    title: 'Write Your Story',
    description: 'Type your topic, notes, or upload source material. Our AI crafts engaging scripts.',
    icon: '✍️',
    color: 0xF59E0B,
    position: [-3, 0.5, -1],
  },
  {
    id: 'voice',
    title: 'Choose Your Voice',
    description: 'Select from 50+ realistic AI voices. Adjust tone, pace, and personality.',
    icon: '🎙️',
    color: 0x6366F1,
    position: [-1, 0.5, -1.5],
  },
  {
    id: 'generate',
    title: 'Generate Instantly',
    description: 'One click produces studio-quality audio with music, transitions, and mastering.',
    icon: '⚡',
    color: 0x22C55E,
    position: [1, 0.5, -1],
  },
  {
    id: 'publish',
    title: 'Publish Everywhere',
    description: 'Export to Spotify, Apple Podcasts, YouTube. RSS feed included automatically.',
    icon: '🌐',
    color: 0xEC4899,
    position: [3, 0.5, -0.5],
  },
];

export function FeaturesSection3D() {
  const { scene } = useThree();
  const featureMeshesRef = useRef<THREE.Group[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create feature visualization objects
    FEATURES.forEach((feature) => {
      const group = new THREE.Group();
      group.name = `feature_${feature.id}`;
      group.position.set(...feature.position);

      // Floating icon container
      const containerGeo = new THREE.SphereGeometry(0.5, 32, 32);
      const containerMat = new THREE.MeshPhysicalMaterial({
        color: feature.color,
        metalness: 0.2,
        roughness: 0.3,
        transparent: true,
        opacity: 0.15,
        transmission: 0.2,
        clearcoat: 1,
      });
      const container = new THREE.Mesh(containerGeo, containerMat);
      container.name = 'container';
      group.add(container);

      // Inner rotating geometry
      const innerGeo = new THREE.OctahedronGeometry(0.25, 1);
      const innerMat = new THREE.MeshPhysicalMaterial({
        color: feature.color,
        metalness: 1,
        roughness: 0.1,
        emissive: feature.color,
        emissiveIntensity: 0.2,
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.name = 'inner';
      group.add(inner);

      // Accent ring
      const ringGeo = new THREE.TorusGeometry(0.6, 0.02, 16, 64);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshPhysicalMaterial({
        color: feature.color,
        metalness: 1,
        roughness: 0.05,
      }));
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      group.userData = { feature, basePosition: feature.position };
      scene.add(group);
      featureMeshesRef.current.push(group);
    });

    // GSAP animations
    const ctx = gsap.context(() => {
      featureMeshesRef.current.forEach((mesh, i) => {
        gsap.from(mesh.position, {
          y: -2,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.2 + i * 0.15,
          scrollTrigger: {
            trigger: '[data-scroll-section="features"]',
            start: 'top 80%',
          },
        });

        gsap.to(mesh.rotation, {
          y: Math.PI * 2,
          scrollTrigger: {
            trigger: '[data-scroll-section="features"]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });

        // Scale on scroll
        gsap.to(mesh.scale, {
          x: 1.1,
          y: 1.1,
          z: 1.1,
          scrollTrigger: {
            trigger: '[data-scroll-section="features"]',
            start: 'top center',
            end: 'center center',
            scrub: 1,
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    featureMeshesRef.current.forEach((mesh, i) => {
      // Floating animation
      const basePos = mesh.userData?.basePosition as number[] | undefined;
      if (basePos) {
        mesh.position.y = basePos[1] + Math.sin(t * 0.8 + i) * 0.1;
      }
      
      // Inner rotation
      const inner = mesh.getObjectByName('inner');
      if (inner) {
        inner.rotation.y += 0.01;
        inner.rotation.x += 0.005;
      }

      // Container pulse
      const container = mesh.getObjectByName('container');
      if (container) {
        container.scale.setScalar(1 + Math.sin(t * 1.5 + i) * 0.05);
      }
    });
  });

  return (
    <>
      <Html
        fullscreen
        distanceFactor={15}
        zIndexRange={[100, 200]}
        transform={true}
        sprite={false}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '100%',
          maxWidth: '900px',
          padding: '0 2rem',
          pointerEvents: 'none',
        }}>
          <div className="text-center mb-16" style={{ pointerEvents: 'auto' }}>
            <span className="text-sm font-medium text-amber-500 uppercase tracking-wider">
              The Signal Chain
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white mt-4 mb-6">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-indigo-500">
                Create
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A complete podcast production pipeline in your browser. From idea to published episode in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16" style={{ pointerEvents: 'auto' }}>
            {FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${feature.color.toString(16).padStart(6, '0')}10, transparent)`,
                  borderColor: `${feature.color.toString(16).padStart(6, '0')}30`,
                }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color.toString(16).padStart(6, '0')}20, ${feature.color.toString(16).padStart(6, '0')}05)`,
                    border: `1px solid ${feature.color.toString(16).padStart(6, '0')}30`,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold font-display text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Html>
    </>
  );
}