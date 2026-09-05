/**
 * Speakers Section 3D - The Talent
 * Interactive 3D speaker avatars with personality
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Html } from '@react-three/drei';

import { createSpeakerAvatar, SPEAKER_PRESETS, animateSpeakerAvatar } from '../objects/SpeakerAvatars';

gsap.registerPlugin(ScrollTrigger);

export function SpeakersSection3D() {
  const { scene, camera, raycaster, mouse } = useThree();
  const avatarsRef = useRef<THREE.Group[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create speaker avatars
    SPEAKER_PRESETS.forEach((preset, i) => {
      const avatar = createSpeakerAvatar(preset);
      avatar.position.set(
        (i - 2) * 2.2,
        0.3,
        0
      );
      avatar.scale.setScalar(0.85);
      avatar.userData.preset = preset;
      avatar.userData.index = i;
      scene.add(avatar);
      avatarsRef.current.push(avatar);
    });

    // GSAP entrance
    const ctx = gsap.context(() => {
      avatarsRef.current.forEach((avatar, i) => {
        gsap.from(avatar.position, {
          y: -1,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.2 + i * 0.1,
          scrollTrigger: {
            trigger: '[data-scroll-section="speakers"]',
            start: 'top 80%',
          },
        });

        gsap.from(avatar.scale, {
          x: 0.5,
          y: 0.5,
          z: 0.5,
          duration: 1,
          ease: 'back.out(1.5)',
          delay: 0.3 + i * 0.1,
          scrollTrigger: {
            trigger: '[data-scroll-section="speakers"]',
            start: 'top 80%',
          },
        });

        // Staggered float
        gsap.to(avatar.position, {
          y: '+=0.3',
          duration: 2.5 + i * 0.3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        });
      });
    });

    // Raycast for hover
    const handleMouseMove = (event: MouseEvent) => {
      const rect = event.target as HTMLCanvasElement;
      if (!rect) return;
      
      const rect_bounds = rect.getBoundingClientRect();
      mouse.x = ((event.clientX - rect_bounds.left) / rect_bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - rect_bounds.top) / rect_bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        SPEAKER_PRESETS.map((_, i) => scene.getObjectByName(`Speaker_${SPEAKER_PRESETS[i].name}`)!).filter(Boolean),
        true
      );

      if (intersects.length > 0) {
        const avatar = intersects[0].object;
        while (avatar.parent && !avatar.name.startsWith('Speaker_')) {
          avatar = avatar.parent;
        }
        const index = avatarsRef.current.findIndex(a => a === avatar);
        if (index !== -1) setHoveredIndex(index);
      } else {
        setHoveredIndex(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    SPEAKER_PRESETS.forEach((_, i) => {
      const avatar = scene.getObjectByName(`Speaker_${SPEAKER_PRESETS[i].name}`);
      if (avatar) {
        animateSpeakerAvatar(avatar, t, 0, hoveredIndex === i);
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
          maxWidth: '1000px',
          padding: '0 2rem',
          pointerEvents: 'none',
        }}>
          <div className="text-center mb-16" style={{ pointerEvents: 'auto' }}>
            <span className="text-sm font-medium text-amber-500 uppercase tracking-wider">
              The Talent
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white mt-4 mb-6">
              Create Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-amber-500">
                Dream Team
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Cast multiple AI speakers with unique voices and personalities. Mix and match to create dynamic conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ pointerEvents: 'auto' }}>
            {SPEAKER_PRESETS.map((preset, i) => (
              <div
                key={preset.name}
                className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-indigo-500/50 hover:border-amber-500/50 transition-all duration-500 cursor-pointer relative overflow-hidden"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  background: `linear-gradient(135deg, ${preset.primaryColor.toString(16).padStart(6, '0')}10, transparent)`,
                  borderColor: `${preset.primaryColor.toString(16).padStart(6, '0')}30`,
                }}
              >
                {/* 3D Avatar preview area */}
                <div className="relative h-40 mb-6">
                  <canvas
                    className="w-full h-full"
                    data-avatar-index={i}
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
                
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, #${preset.primaryColor.toString(16).padStart(6, '0')}, #${preset.secondaryColor.toString(16).padStart(6, '0')})`,
                    }}
                  >
                    {preset.name[0]}
                  </div>
                  <span className="text-2xl font-bold font-display text-white">{preset.name}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium text-slate-300"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primaryColor.toString(16).padStart(6, '0')}20, ${preset.secondaryColor.toString(16).padStart(6, '0')}20)`,
                    border: `1px solid ${preset.primaryColor.toString(16).padStart(6, '0')}30`,
                  }}
                >
                  {preset.role}
                </span>
                <p className="text-slate-400 text-sm mt-4">
                  {preset.personality.charAt(0).toUpperCase() + preset.personality.slice(1)} personality · Unique voice signature
                </p>
              </div>
            ))}
          </div>
        </div>
      </Html>
    </>
  );
}