import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface WaveformProps {
  className?: string;
  barCount?: number;
  color?: string;
  height?: number;
  animated?: boolean;
}

export function Waveform({
  className = '',
  barCount = 40,
  color = 'var(--primary)',
  height = 40,
  animated = true,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated || !containerRef.current) return;

    const bars = containerRef.current.querySelectorAll('.wave-bar');
    const ctx = gsap.context(() => {
      bars.forEach((bar, i) => {
        const delay = i * 0.05;
        const peakHeight = Math.sin((i / barCount) * Math.PI) * height * 0.8;

        gsap.fromTo(
          bar,
          { height: 2 },
          {
            height: Math.max(2, peakHeight),
            duration: 0.8,
            delay,
            ease: 'power2.out',
          }
        );

        if (animated) {
          gsap.to(bar, {
            height: Math.max(2, peakHeight * 0.4 + Math.random() * peakHeight * 0.6),
            duration: 1.2 + Math.random() * 0.8,
            delay: delay + 0.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [animated, barCount, height]);

  return (
    <div
      ref={containerRef}
      className={`flex items-end gap-[2px] ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const peak = Math.sin((i / barCount) * Math.PI);
        return (
          <div
            key={i}
            className="wave-bar rounded-full"
            style={{
              width: 3,
              height: 2,
              backgroundColor: color,
              opacity: 0.3 + peak * 0.5,
            }}
          />
        );
      })}
    </div>
  );
}
