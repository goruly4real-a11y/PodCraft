/**
 * InteractiveCursor - Custom cursor with hover effects
 * 
 * Features:
 * - Small dot that follows cursor with spring physics
 * - Ring that appears on hover over interactive elements
 * - Hidden on touch devices
 * - Smooth lerp-based movement
 * 
 * Usage: <InteractiveCursor /> (place in root component)
 */

import { useEffect, useRef, useState } from 'react';

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  isClicking: boolean;
}

export function InteractiveCursor() {
  const [cursor, setCursor] = useState<CursorState>({ x: 0, y: 0, isHovering: false, isClicking: false });
  const [isVisible, setIsVisible] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setCursor((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => {
      setCursor((prev) => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = () => {
      setCursor((prev) => ({ ...prev, isClicking: false }));
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const addHoverListeners = () => {
      const interactives = document.querySelectorAll('a, button, [data-cursor-hover]');
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => setCursor((prev) => ({ ...prev, isHovering: true })));
        el.addEventListener('mouseleave', () => setCursor((prev) => ({ ...prev, isHovering: false })));
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, [isVisible]);

  useEffect(() => {
    let animFrame: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${cursor.x - 3}px, ${cursor.y - 3}px)`;
      }
      if (ringRef.current) {
        const ringX = lerp(parseFloat(ringRef.current.style.left || '0') || cursor.x, cursor.x, 0.15);
        const ringY = lerp(parseFloat(ringRef.current.style.top || '0') || cursor.y, cursor.y, 0.15);
        ringRef.current.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;
      }
      animFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, [cursor]);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (isTouchDevice) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" style={{ opacity: isVisible ? 1 : 0 }}>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-primary rounded-full transition-transform duration-100"
        style={{
          transform: `translate(${cursor.x - 3}px, ${cursor.y - 3}px) scale(${cursor.isHovering ? 1.5 : 1})`,
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-primary/50 rounded-full transition-all duration-200"
        style={{
          transform: `translate(${cursor.x - 16}px, ${cursor.y - 16}px) scale(${cursor.isClicking ? 0.8 : 1})`,
          opacity: cursor.isHovering ? 1 : 0,
        }}
      />
    </div>
  );
}
