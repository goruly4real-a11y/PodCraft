/**
 * Hero Section 3D - The Studio Entrance
 * Cinematic microphone reveal with particle atmosphere
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Html } from '@react-three/drei';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection3D() {
  const { scene, camera } = useThree();
  const micRef = useRef<THREE.Group | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Find microphone in scene
    const mic = scene.getObjectByName('SM7B') || scene.getObjectByName('SM7BSimple');
    if (mic) micRef.current = mic;

    // GSAP entrance animation
    const ctx = gsap.context(() => {
      // Mic entrance
      if (micRef.current) {
        gsap.from(micRef.current.position, {
          y: -2,
          opacity: 0,
          duration: 1.5,
          ease: 'power3.out',
          delay: 0.3,
        });

        gsap.from(micRef.current.rotation, {
          y: Math.PI,
          duration: 2,
          ease: 'power3.out',
          delay: 0.3,
        });
      }

      // Title reveal
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power3.out',
        delay: 0.8,
      });

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        delay: 1.1,
      });

      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
        delay: 1.4,
      });

      // Scroll parallax
      if (micRef.current) {
        gsap.to(micRef.current.position, {
          y: 0.5,
          scrollTrigger: {
            trigger: '[data-scroll-section="hero"]',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });

        gsap.to(micRef.current.rotation, {
          x: -0.2,
          scrollTrigger: {
            trigger: '[data-scroll-section="hero"]',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [scene]);

  // Floating animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (micRef.current) {
      micRef.current.position.y = 1.2 + Math.sin(t * 0.6) * 0.03;
      micRef.current.rotation.y += 0.0005;
    }

    // Camera subtle drift
    camera.position.x = Math.sin(t * 0.15) * 0.3;
    camera.position.y = 1.5 + Math.cos(t * 0.1) * 0.1;
    camera.lookAt(0, 1.2, 0);
  });

  return (
    <>
      {/* HTML Overlay - Hero Content */}
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
          <div ref={titleRef} className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight font-display text-white"
            style={{ pointerEvents: 'auto' }}>
            Turn Words Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-500">
              Podcasts
            </span>
          </div>

          <p ref={subtitleRef} className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto"
            style={{ pointerEvents: 'auto' }}>
            Create professional podcasts with AI-powered voices. No recording needed. Just write and publish.
          </p>

          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ pointerEvents: 'auto' }}>
            <a
              href="/login"
              className="px-8 py-4 bg-amber-500 text-amber-950 font-semibold rounded-xl hover:bg-amber-400 transition-all text-lg"
              style={{ pointerEvents: 'auto' }}
            >
              Get Started Free →
            </a>
            <button className="px-8 py-4 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:border-amber-500 hover:text-amber-500 transition-all text-lg"
              style={{ pointerEvents: 'auto' }}
            >
              See How It Works
            </button>
          </div>
        </div>
      </Html>
    </>
  );
}