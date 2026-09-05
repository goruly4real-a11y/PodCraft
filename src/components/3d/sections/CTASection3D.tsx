/**
 * CTA Section 3D - The Release
 * Climactic moment with podcast episode as physical object
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Html } from '@react-three/drei';

gsap.registerPlugin(ScrollTrigger);

export function CTASection3D() {
  const { scene } = useThree();
  const episodeRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create podcast episode as a vinyl record / cassette
    const episode = new THREE.Group();
    episode.name = 'podcastEpisode';
    episode.position.set(0, 1.2, -2);

    // Vinyl record
    const vinylGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.02, 64);
    const vinylMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a15,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
    const vinyl = new THREE.Mesh(vinylGeo, vinylMat);
    vinyl.castShadow = true;
    vinyl.receiveShadow = true;
    episode.add(vinyl);

    // Center label
    const labelGeo = new THREE.CircleGeometry(0.15, 64);
    const labelMat = new THREE.MeshPhysicalMaterial({
      color: 0xF59E0B,
      metalness: 0.8,
      roughness: 0.2,
    });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0, 0, 0.011);
    episode.add(label);

    // Grooves texture simulation
    for (let r = 0.18; r < 0.55; r += 0.015) {
      const grooveGeo = new THREE.TorusGeometry(r, 0.001, 8, 128);
      const grooveMat = new THREE.MeshBasicMaterial({
        color: 0x050505,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const groove = new THREE.Mesh(grooveGeo, grooveMat);
      groove.rotation.x = Math.PI / 2;
      episode.add(groove);
    }

    // Spindle hole
    const holeGeo = new THREE.CircleGeometry(0.035, 32);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.z = 0.012;
    episode.add(hole);

    episodeRef.current = episode;
    episode.position.set(0, 1.2, -2);
    scene.add(episode);

    // Burst particles on CTA
    const burstGeo = new THREE.BufferGeometry();
    const burstCount = 200;
    const positions = new Float32Array(burstCount * 3);
    const velocities = new Float32Array(burstCount * 3);
    
    for (let i = 0; i < burstCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 1.2;
      positions[i * 3 + 2] = -2;
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.1 + Math.random() * 0.2;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }

    const burstGeoFinal = new THREE.BufferGeometry();
    burstGeoFinal.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    burstGeoFinal.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const burstMat = new THREE.PointsMaterial({
      color: 0xF59E0B,
      size: 0.05,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const burstParticles = new THREE.Points(burstGeoFinal, burstMat);
    burstParticles.name = 'burstParticles';
    burstParticles.userData = { active: false, time: 0, velocities };
    scene.add(burstParticles);
    particlesRef.current = burstParticles;

    // Entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        { rotation: Math.PI },
        { rotation: 0, duration: 2, ease: 'power3.out', delay: 0.2 },
        {
          onUpdate: function() {
            if (episodeRef.current) {
              episodeRef.current.rotation.y = this.targets()[0].rotation;
            }
          },
        }
      );

      gsap.from({ y: 3 }, {
        y: 1.2,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.3,
        onUpdate: function() {
          if (episodeRef.current) {
            episodeRef.current.position.y = this.targets()[0].y;
          }
        },
        scrollTrigger: {
          trigger: '[data-scroll-section="cta"]',
          start: 'top 80%',
        },
      });

      // Spin on scroll
      gsap.to({}, {
        scrollTrigger: {
          trigger: '[data-scroll-section="cta"]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            if (episodeRef.current) {
              episodeRef.current.rotation.y = self.progress * Math.PI * 4;
            }
          },
        },
      });

      // Float
      gsap.to({}, {
        scrollTrigger: {
          trigger: '[data-scroll-section="cta"]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            if (episodeRef.current) {
              episodeRef.current.position.y = 1.2 + Math.sin(self.progress * Math.PI * 4) * 0.1;
            }
          },
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // Burst effect on CTA hover
  const triggerBurst = () => {
    const burst = scene.getObjectByName('burstParticles') as THREE.Points;
    if (!burst || burst.userData.active) return;
    
    burst.userData.active = true;
    burst.userData.time = 0;
    burst.material.opacity = 1;
    
    gsap.to(burst.material, {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out',
      onComplete: () => {
        burst.userData.active = false;
        // Reset positions
        const positions = burst.geometry.attributes.position.array;
        const velocities = burst.userData.velocities;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = 0;
          positions[i + 1] = 1.2;
          positions[i + 2] = -2;
        }
        burst.geometry.attributes.position.needsUpdate = true;
      },
    });
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Vinyl spin
    if (episodeRef.current) {
      episodeRef.current.rotation.y += 0.005;
      
      // Gentle float
      episodeRef.current.position.y = 1.2 + Math.sin(t * 0.7) * 0.02;
      episodeRef.current.rotation.x = Math.sin(t * 0.3) * 0.02;
    }

    // Burst particles
    const burst = scene.getObjectByName('burstParticles') as THREE.Points;
    if (burst && burst.userData.active) {
      burst.userData.time += state.clock.getDelta();
      const positions = burst.geometry.attributes.position.array;
      const velocities = burst.userData.velocities;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * 0.5;
        positions[i + 1] += velocities[i + 1] * 0.5;
        positions[i + 2] += velocities[i + 2] * 0.5;
        // Gravity
        velocities[i + 1] -= 0.005;
      }
      burst.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <Html
        fullscreen
        distanceFactor={10}
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
          maxWidth: '800px',
          padding: '0 2rem',
          pointerEvents: 'none',
        }}>
          <div className="text-center mb-12" style={{ pointerEvents: 'auto' }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Free to start
            </span>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-6">
              Ready to Release Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-indigo-500">
                First Episode?
              </span>
            </h2>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join thousands of creators using PodCraft to produce professional podcasts in minutes, not hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12" style={{ pointerEvents: 'auto' }}>
              <button
                onMouseEnter={triggerBurst}
                className="group px-10 py-5 bg-amber-500 text-amber-950 font-semibold text-lg rounded-xl hover:bg-amber-400 hover:scale-105 transition-all duration-300 shadow-xl shadow-amber-500/25"
                style={{ pointerEvents: 'auto' }}
              >
                Start Crafting - Free
              </button>
              <button className="px-10 py-5 border-2 border-slate-700 text-slate-300 font-semibold text-lg rounded-xl hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all duration-300">
                See How It Works
              </button>
            </div>

            <p className="text-sm text-slate-500">
              No credit card required · 5 free credits · Cancel anytime
            </p>
          </div>
        </div>
      </Html>
    </>
  );
}