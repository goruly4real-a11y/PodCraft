/**
 * AudioBars - Animated audio visualization bars
 * 
 * Features:
 * - SVG-based animated equalizer bars
 * - Random height animation for realistic audio effect
 * - Configurable bar count and colors
 * - Toggle play/pause state
 * 
 * Usage: <AudioBars barCount={5} isPlaying={true} color="#F59E0B" />
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface WaveformAnimationProps {
  className?: string;
  barCount?: number;
  color?: string;
  secondaryColor?: string;
}

export function WaveformAnimation({
  className = '',
  barCount = 32,
  color = '#F59E0B',
  secondaryColor = '#10B981',
}: WaveformAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const bars = svgRef.current.querySelectorAll('rect');
    
    const animate = () => {
      bars.forEach((bar) => {
        const height = 10 + Math.random() * 40;
        const y = 50 - height / 2;
        gsap.to(bar, {
          attr: { height, y },
          duration: 0.15,
          ease: 'power2.out',
        });
      });
    };

    const interval = setInterval(animate, 150);

    return () => clearInterval(interval);
  }, [barCount]);

  const barWidth = 100 / barCount - 1;

  return (
    <svg ref={svgRef} viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
      {Array.from({ length: barCount }, (_, i) => (
        <rect
          key={i}
          x={i * (100 / barCount) + 0.5}
          y={45}
          width={barWidth}
          height={10}
          fill={i % 2 === 0 ? color : secondaryColor}
          rx="1"
        />
      ))}
    </svg>
  );
}

interface AudioBarsProps {
  className?: string;
  barCount?: number;
  color?: string;
  isPlaying?: boolean;
}

export function AudioBars({
  className = '',
  barCount = 5,
  color = '#F59E0B',
  isPlaying = true,
}: AudioBarsProps) {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barsRef.current || !isPlaying) return;

    const bars = barsRef.current.querySelectorAll('.bar');
    
    bars.forEach((_bar) => {
      gsap.to(_bar, {
        scaleY: () => 0.3 + Math.random() * 0.7,
        duration: 0.2,
        ease: 'power2.out',
        repeat: -1,
        yoyo: true,
      });
    });
  }, [isPlaying, barCount]);

  return (
    <div ref={barsRef} className={`flex items-end gap-1 ${className}`}>
      {Array.from({ length: barCount }, (_, i) => (
        <div
          key={i}
          className="bar w-1 bg-current rounded-full origin-bottom"
          style={{
            height: '100%',
            color,
            opacity: isPlaying ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
