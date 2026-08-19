/**
 * SparkleEffect - Burst of sparkle particles on click
 * 
 * Creates a burst of colorful particles that radiate outward
 * from the click point, then fade out.
 * 
 * Usage: <SparkleEffect><Button>Click me</Button></SparkleEffect>
 */

import { useCallback, useRef } from 'react';

interface SparkleEffectProps {
  children: React.ReactNode;
  className?: string;
  count?: number;
  colors?: string[];
}

export function SparkleEffect({
  children,
  className = '',
  count = 6,
  colors = ['#F59E0B', '#FFFFFF', '#10B981'],
}: SparkleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement[]>([]);

  const createSparkle = useCallback(
    (x: number, y: number) => {
      const container = containerRef.current;
      if (!container) return;

      for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const velocity = 30 + Math.random() * 40;
        const size = 4 + Math.random() * 4;
        const color = colors[Math.floor(Math.random() * colors.length)];

        sparkle.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 50;
          transform: translate(-50%, -50%);
        `;

        container.appendChild(sparkle);
        sparklesRef.current.push(sparkle);

        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let opacity = 1;
        let currentX = x;
        let currentY = y;
        let frame = 0;

        const animate = () => {
          frame++;
          opacity -= 0.03;
          currentX += vx * 0.1;
          currentY += vy * 0.1;

          sparkle.style.left = `${currentX}px`;
          sparkle.style.top = `${currentY}px`;
          sparkle.style.opacity = `${opacity}`;
          sparkle.style.transform = `translate(-50%, -50%) scale(${opacity})`;

          if (opacity > 0) {
            requestAnimationFrame(animate);
          } else {
            sparkle.remove();
            sparklesRef.current = sparklesRef.current.filter((s) => s !== sparkle);
          }
        };

        requestAnimationFrame(animate);
      }
    },
    [count, colors]
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      createSparkle(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onClick={handleClick}
      style={{ overflow: 'visible' }}
    >
      {children}
    </div>
  );
}
