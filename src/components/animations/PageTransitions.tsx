/**
 * ============================================================================
 * PAGE TRANSITION ANIMATIONS
 * ============================================================================
 * 
 * This component provides smooth transitions between pages in the app.
 * Instead of pages instantly appearing/disappearing, they fade and slide.
 * 
 * HOW PAGE TRANSITIONS WORK:
 * --------------------------
 * 1. User clicks a link
 * 2. Current page plays "exit" animation (fade out, slide up)
 * 3. New page plays "enter" animation (fade in, slide up from below)
 * 4. The transition feels smooth and professional
 * 
 * WHY USE TRANSITIONS?
 * --------------------
 * - Makes the app feel polished and professional
 * - Provides visual continuity (users understand what's happening)
 * - Reduces cognitive load (less jarring changes)
 * 
 * ============================================================================
 */

import { useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { animate, stagger } from 'animejs';

/**
 * Props for PageTransition component
 * 
 * children: The page content to wrap with transitions
 * className: Additional CSS classes
 */
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition Component
 * =======================
 * 
 * Wraps page content and adds enter/exit animations.
 * 
 * USAGE:
 * ------
 * <PageTransition>
 *   <MyPageContent />
 * </PageTransition>
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  // useRef creates a reference to the container div
  const containerRef = useRef<HTMLDivElement>(null);
  
  // useLocation gives us the current URL path
  // When path changes, we know the page changed
  const location = useLocation();
  
  // Track if this is the first render
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Skip animation on first render (page just loaded)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Get all direct children of the container
    const children = Array.from(containerRef.current.children);

    /**
     * Animate the page entrance
     * 
     * stagger(50) creates a 50ms delay between each child's animation
     * This creates a "cascade" effect where elements appear one by one
     */
    animate(children, {
      opacity: [0, 1],        // Fade in
      translateY: [30, 0],    // Slide up from 30px below
      duration: 600,          // 600ms animation
      delay: stagger(80),     // 80ms between each child
      ease: 'outQuad',        // Starts fast, slows down
    });
  }, [location.pathname]);  // Re-run when URL changes

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * FadeIn Component
 * ================
 * 
 * Simple fade-in animation for any element.
 * Use this to animate individual elements when they appear.
 * 
 * USAGE:
 * ------
 * <FadeIn delay={200}>
 *   <p>This text fades in after 200ms</p>
 * </FadeIn>
 */
interface FadeInProps {
  children: ReactNode;
  delay?: number;  // Delay before animation starts (ms)
  duration?: number;  // Animation duration (ms)
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 500,
  className = '' 
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    animate(ref.current, {
      opacity: [0, 1],          // Fade in
      translateY: [20, 0],      // Slide up
      duration,
      delay,
      ease: 'outQuad',
    });
  }, [delay, duration]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/**
 * SlideIn Component
 * =================
 * 
 * Slide-in animation from a direction.
 * Elements slide in from left, right, top, or bottom.
 * 
 * USAGE:
 * ------
 * <SlideIn direction="left">
 *   <p>This slides in from the left</p>
 * </SlideIn>
 */
interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  distance?: number;  // How far to slide (px)
  className?: string;
}

export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  distance = 50,
  className = '',
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Calculate starting position based on direction
    let startX = 0;
    let startY = 0;

    switch (direction) {
      case 'left':
        startX = -distance;  // Start to the left
        break;
      case 'right':
        startX = distance;   // Start to the right
        break;
      case 'top':
        startY = -distance;  // Start above
        break;
      case 'bottom':
        startY = distance;   // Start below
        break;
    }

    animate(ref.current, {
      opacity: [0, 1],
      translateX: [startX, 0],
      translateY: [startY, 0],
      duration: 600,
      delay,
      ease: 'outQuad',
    });
  }, [direction, delay, distance]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/**
 * ScaleIn Component
 * =================
 * 
 * Scale-up animation (starts small, grows to full size).
 * 
 * USAGE:
 * ------
 * <ScaleIn>
 *   <div>This grows into view</div>
 * </ScaleIn>
 */
interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  scale?: number;  // Starting scale (0.5 = half size)
  className?: string;
}

export function ScaleIn({
  children,
  delay = 0,
  scale = 0.8,
  className = '',
}: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    animate(ref.current, {
      opacity: [0, 1],
      scale: [scale, 1],
      duration: 500,
      delay,
      ease: 'outBack(1.7)',  // Bouncy overshoot
    });
  }, [delay, scale]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/**
 * StaggerList Component
 * ====================
 * 
 * Animates a list of items to appear one after another.
 * 
 * USAGE:
 * ------
 * <StaggerList>
 *   {items.map(item => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </StaggerList>
 */
interface StaggerListProps {
  children: ReactNode;
  staggerDelay?: number;  // Delay between items (ms)
  className?: string;
}

export function StaggerList({
  children,
  staggerDelay = 50,
  className = '',
}: StaggerListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const items = Array.from(ref.current.children);
    if (items.length === 0) return;

    animate(items, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      delay: stagger(staggerDelay),
      ease: 'outQuad',
    });
  }, [staggerDelay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
