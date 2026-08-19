/**
 * PodcastGenerationAnimation - Animated podcast generation visualization
 * 
 * Features:
 * - Canvas particle system that reacts to generation state
 * - Two speaker avatars with connection line
 * - Particles converge toward center during generation
 * - Success state: ring explosion + checkmark with elastic bounce
 * - Error state: X icon display
 * 
 * States: 'connecting' | 'generating' | 'success' | 'error'
 * 
 * Usage: <PodcastGenerationAnimation speakers={[...]} status="generating" />
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface PodcastGenerationAnimationProps {
  speakers: Array<{ name: string; color: string }>;
  status: 'connecting' | 'generating' | 'success' | 'error';
  progress?: number;
}

export function PodcastGenerationAnimation({
  speakers,
  status,
  progress = 0,
}: PodcastGenerationAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize particles
    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      color: speakers.length > 0 ? speakers[Math.floor(Math.random() * speakers.length)].color : '#F59E0B',
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connection line between speakers
      if (speakers.length >= 2 && status !== 'success') {
        const gradient = ctx.createLinearGradient(100, centerY, width - 100, centerY);
        gradient.addColorStop(0, speakers[0].color + '60');
        gradient.addColorStop(1, speakers[1].color + '60');

        ctx.beginPath();
        ctx.moveTo(100, centerY);
        ctx.lineTo(width - 100, centerY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Animate particles
      particlesRef.current.forEach((p) => {
        if (status === 'generating') {
          // Pull particles toward center
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 10) {
            p.vx += (dx / dist) * 0.3;
            p.vy += (dy / dist) * 0.3;
          }
        } else if (status === 'success') {
          // Explode outward
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / dist) * 2;
          p.vy += (dy / dist) * 2;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [speakers, status]);

  useEffect(() => {
    if (status === 'success' && containerRef.current) {
      setShowSuccess(true);

      // Success burst animation
      gsap.fromTo(
        '.success-icon',
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }
      );

      gsap.fromTo(
        '.success-text',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.3 }
      );

      // Ring explosion
      gsap.fromTo(
        '.ring',
        { scale: 0, opacity: 1 },
        { scale: 3, opacity: 0, duration: 1, stagger: 0.15, ease: 'power2.out' }
      );
    }
  }, [status]);

  return (
    <div ref={containerRef} className="relative w-full h-64 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Speaker avatars */}
      {speakers.map((speaker, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center z-10"
          style={{
            left: i === 0 ? '15%' : 'auto',
            right: i === 1 ? '15%' : 'auto',
            transform: status === 'generating' ? `translateX(${i === 0 ? '30%' : '-30%'})` : 'none',
            transition: 'transform 0.8s ease-out',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2 relative"
            style={{ backgroundColor: speaker.color + '30', color: speaker.color }}
          >
            {speaker.name[0]}
            {status === 'generating' && (
              <div
                className="absolute inset-0 rounded-full border-2 animate-ping"
                style={{ borderColor: speaker.color }}
              />
            )}
          </div>
          <span className="text-sm font-medium">{speaker.name}</span>
        </div>
      ))}

      {/* Center content */}
      <div className="relative z-20 text-center">
        {status === 'connecting' && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Connecting speakers...</span>
          </div>
        )}

        {status === 'generating' && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
            </div>
            <span className="text-sm text-muted-foreground">Generating podcast...</span>
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'success' && showSuccess && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {/* Explosion rings */}
              <div className="ring absolute inset-0 w-16 h-16 rounded-full border-2 border-secondary" />
              <div className="ring absolute inset-0 w-16 h-16 rounded-full border-2 border-primary" />
              <div className="ring absolute inset-0 w-16 h-16 rounded-full border-2 border-accent" />

              <div className="success-icon w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
            <span className="success-text text-lg font-semibold text-secondary">Podcast Created!</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <span className="text-sm text-destructive">Generation failed</span>
          </div>
        )}
      </div>
    </div>
  );
}
