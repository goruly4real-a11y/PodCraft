/**
 * FloatingIcons - Background decoration with floating audio icons
 * 
 * Renders microphone, headphone, and audio icons that slowly
 * drift upward with subtle rotation. Used for background ambiance.
 * 
 * Usage: <FloatingIcons count={6} colors={['#F59E0B']} />
 */

import { useEffect, useRef } from 'react';
import { Mic, Headphones, AudioLines, Radio, Mic2 } from 'lucide-react';

interface FloatingIcon {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

interface FloatingIconsProps {
  className?: string;
  count?: number;
  colors?: string[];
}

export function FloatingIcons({
  className = '',
  count = 6,
  colors = ['#F59E0B', '#10B981', '#8B5CF6'],
}: FloatingIconsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<FloatingIcon[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const iconComponents = [Mic, Headphones, AudioLines, Radio, Mic2];
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    iconsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.2 + Math.random() * 0.3,
      size: 20 + Math.random() * 20,
      opacity: 0.08 + Math.random() * 0.12,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 0.5,
      icon: iconComponents[Math.floor(Math.random() * iconComponents.length)],
    }));

    const animate = () => {
      iconsRef.current.forEach((icon) => {
        icon.y -= icon.speed;
        icon.rotation += icon.rotationSpeed;

        if (icon.y < -50) {
          icon.y = height + 50;
          icon.x = Math.random() * width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {iconsRef.current.map((icon, i) => {
        const IconComponent = icon.icon;
        const color = colors[i % colors.length];
        return (
          <IconComponent
            key={i}
            className="absolute"
            style={{
              left: `${icon.x}px`,
              top: `${icon.y}px`,
              width: `${icon.size}px`,
              height: `${icon.size}px`,
              color: color,
              opacity: icon.opacity,
              transform: `rotate(${icon.rotation}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
