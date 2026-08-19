/**
 * SVGMorph - SVG shape morphing and animation components
 * 
 * Exports:
 * - SVGMorph: Morphs between multiple SVG path shapes
 * - SVGWave: Animated wave background
 * - SVGCirclePulse: Expanding pulse ring circles
 * 
 * All use GSAP for smooth, performant animations.
 * 
 * Usage: <SVGMorph paths={[path1, path2]} duration={2} />
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SVGMorphProps {
  paths: string[];
  className?: string;
  duration?: number;
  color?: string;
}

export function SVGMorph({ paths, className = '', duration = 2, color = '#F59E0B' }: SVGMorphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current || paths.length < 2) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    paths.forEach((_path) => {
      tl.to(pathRef.current, {
        attr: { d: _path },
        duration,
        ease: 'sine.inOut',
      });
    });

    return () => {
      tl.kill();
    };
  }, [paths, duration]);

  return (
    <svg ref={svgRef} viewBox="0 0 100 100" className={className}>
      <path ref={pathRef} d={paths[0]} fill={color} />
    </svg>
  );
}

interface SVGWaveProps {
  className?: string;
  color?: string;
  amplitude?: number;
  frequency?: number;
  speed?: number;
}

export function SVGWave({
  className = '',
  color = '#F59E0B',
  amplitude = 20,
  frequency = 3,
  speed = 2,
}: SVGWaveProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    let progress = 0;
    const animate = () => {
      progress += 0.02;
      const points: string[] = [];
      for (let x = 0; x <= 100; x += 1) {
        const y = 50 + Math.sin((x * frequency * Math.PI) / 50 + progress * speed) * amplitude;
        points.push(`${x},${y}`);
      }
      pathRef.current?.setAttribute('d', `M0,50 ${points.map((p) => `L${p}`).join(' ')} L100,100 L0,100 Z`);
      requestAnimationFrame(animate);
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [amplitude, frequency, speed]);

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
      <path ref={pathRef} fill={color} opacity="0.3" />
    </svg>
  );
}

interface SVGCirclePulseProps {
  className?: string;
  color?: string;
  count?: number;
}

export function SVGCirclePulse({ className = '', color = '#F59E0B', count = 3 }: SVGCirclePulseProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const circles = svgRef.current.querySelectorAll('circle');
    circles.forEach((circle, i) => {
      gsap.fromTo(
        circle,
        { scale: 0.5, opacity: 0.8 },
        {
          scale: 2,
          opacity: 0,
          duration: 2,
          ease: 'power2.out',
          repeat: -1,
          delay: i * 0.5,
          transformOrigin: 'center center',
        }
      );
    });
  }, [count]);

  return (
    <svg ref={svgRef} viewBox="0 0 100 100" className={className}>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r="10"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
