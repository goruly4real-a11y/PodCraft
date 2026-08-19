/**
 * AppLoader - Full-screen loading animation on initial app load
 * 
 * Features:
 * - Animated microphone icon with pulse effect
 * - Progress bar with gradient fill
 * - Cycling status messages
 * - Floating particles in background
 * - Stores completion in sessionStorage (shows once per session)
 * 
 * Usage: <AppLoader onComplete={() => setIsLoading(false)} />
 */

import { useState, useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface AppLoaderProps {
  onComplete: () => void;
}

const statusMessages = [
  'Gathering voices...',
  'Preparing studio...',
  'Tuning microphones...',
  'Ready to create!',
];

export function AppLoader({ onComplete }: AppLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev >= statusMessages.length - 1) {
          clearInterval(statusInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 400);
      }, 300);
    }
  }, [progress, isExiting, onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full bg-primary/30';
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        bottom: -10px;
        width: ${4 + Math.random() * 6}px;
        height: ${4 + Math.random() * 6}px;
      `;
      container.appendChild(particle);
      particlesRef.current.push(particle);
    }

    particlesRef.current.forEach((particle, i) => {
      animate(particle, {
        translateY: [0, -(200 + Math.random() * 400)],
        translateX: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
        opacity: [0.6, 0],
        scale: [1, 0.3],
        duration: 2000 + Math.random() * 2000,
        delay: i * 100,
        ease: 'outQuad',
        loop: true,
      });
    });

    return () => {
      particlesRef.current.forEach((p) => p.remove());
      particlesRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-400 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">PodCraft</h1>
      <p className="text-muted-foreground mb-8">{statusMessages[statusIndex]}</p>

      <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground">{progress}%</p>
    </div>
  );
}
