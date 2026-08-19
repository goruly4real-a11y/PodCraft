/**
 * ============================================================================
 * LOADING STATE ANIMATIONS
 * ============================================================================
 * 
 * This file contains various loading indicators to show users that
 * something is happening in the background.
 * 
 * WHY LOADING ANIMATIONS MATTER:
 * ------------------------------
 * Without loading indicators:
 * - Users think the app is frozen
 * - Users click multiple times (causing errors)
 * - Users leave thinking it's broken
 * 
 * With loading indicators:
 * - Users know something is happening
 * - Users wait patiently
 * - App feels responsive and professional
 * 
 * ============================================================================
 */

import { useEffect, useRef, ReactNode } from 'react';
import { animate } from 'animejs';

/**
 * Spinner Component
 * =================
 * 
 * A simple spinning circle.
 * This is the most common loading indicator.
 * 
 * HOW IT WORKS:
 * - CSS animation rotates the element 360 degrees
 * - The gap in the circle creates the "spinner" effect
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';  // Small, medium, large
  color?: string;
  className?: string;
}

export function Spinner({ size = 'md', color = 'currentColor', className = '' }: SpinnerProps) {
  // Size mapping
  const sizeClasses = {
    sm: 'w-4 h-4',   // 16px
    md: 'w-8 h-8',   // 32px
    lg: 'w-12 h-12', // 48px
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className}`}
      role="status"  // Accessibility: tells screen readers "loading"
      aria-label="Loading"
    >
      {/**
       * SVG (Scalable Vector Graphics)
       * 
       * We use SVG because:
       * - It scales to any size without losing quality
       * - It's lightweight (just XML text)
       * - CSS can animate it smoothly
       * 
       * The circle has:
       * - stroke: The visible part (like the pen drawing)
       * - stroke-dasharray: Creates the gap in the circle
       * - stroke-dashoffset: Rotates the gap to create spinning effect
       */}
      <svg
        className="animate-spin"  // Tailwind CSS animation
        viewBox="0 0 24 24"
        fill="none"
        style={{ color }}
      >
        <circle
          className="opacity-25"  // Faded background circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"  // Bright spinning part
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

/**
 * PulseLoader Component
 * =====================
 * 
 * Three dots that pulse in sequence.
 * More friendly and modern than a spinner.
 * 
 * HOW IT WORKS:
 * - Each dot scales up and down
 * - They're staggered so they pulse one after another
 */
interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function PulseLoader({ size = 'md', color = '#F59E0B', className = '' }: PulseLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get all dots
    const dots = Array.from(containerRef.current.children);

    /**
     * Animate each dot with a stagger delay
     * 
     * scale: [1, 1.5, 1] means:
     * - Start at normal size (1)
     * - Grow to 150% (1.5)
     * - Return to normal (1)
     * 
     * loop: true makes it repeat forever
     */
    animate(dots, {
      scale: [1, 1.5, 1],
      duration: 600,
      delay: 100,  // 100ms between each dot
      loop: true,
      ease: 'inOutQuad',
    });
  }, []);

  const sizeClasses = {
    sm: 'w-1 h-1',   // 4px
    md: 'w-2 h-2',   // 8px
    lg: 'w-3 h-3',   // 12px
  };

  return (
    <div
      ref={containerRef}
      className={`flex items-center gap-1 ${className}`}
      role="status"
      aria-label="Loading"
    >
      {/* Three dots */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} rounded-full`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

/**
 * BarLoader Component
 * ===================
 * 
 * A horizontal bar that fills and empties.
 * Good for showing progress or loading.
 */
interface BarLoaderProps {
  width?: string;
  height?: string;
  color?: string;
  className?: string;
}

export function BarLoader({
  width = '200px',
  height = '4px',
  color = '#F59E0B',
  className = '',
}: BarLoaderProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;

    /**
     * Animate the bar width
     * 
     * The bar:
     * - Starts at 0% width
     * - Grows to 100% width
     * - Returns to 0% width
     * - Loops forever
     */
    animate(barRef.current, {
      width: ['0%', '100%', '0%'],
      duration: 1500,
      loop: true,
      ease: 'inOutQuad',
    });
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-full ${className}`}
      style={{ width, height, backgroundColor: `${color}20` }}
      role="status"
      aria-label="Loading"
    >
      <div
        ref={barRef}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

/**
 * SkeletonLoader Component
 * ========================
 * 
 * Shows placeholder content while real content loads.
 * 
 * WHY SKELETONS?
 * --------------
 * Instead of showing a spinner (which gives no hint of what's coming),
 * skeleton loaders show the shape of the content:
 * - Text lines appear as gray bars
 * - Images appear as gray rectangles
 * - This reduces perceived loading time
 * 
 * USAGE:
 * ------
 * <SkeletonLoader lines={3} />  // Three line skeleton
 */
interface SkeletonLoaderProps {
  lines?: number;  // Number of text lines to show
  className?: string;
}

export function SkeletonLoader({ lines = 3, className = '' }: SkeletonLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const skeletons = Array.from(containerRef.current.children);

    /**
     * Shimmer animation
     * 
     * Each skeleton line:
     * - Has a gradient background
     * - The gradient moves from left to right
     * - Creates a "shimmer" effect
     */
    animate(skeletons, {
      opacity: [0.5, 1, 0.5],
      duration: 1500,
      delay: 100,
      loop: true,
      ease: 'inOutQuad',
    });
  }, []);

  return (
    <div ref={containerRef} className={`space-y-3 ${className}`} role="status">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded"
          // Make last line shorter (like real text)
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * CardSkeleton Component
 * =====================
 * 
 * Skeleton that looks like a card (image + text).
 * Used when loading podcast or speaker cards.
 */
interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className = '' }: CardSkeletonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = Array.from(containerRef.current.querySelectorAll('.skeleton'));

    animate(elements, {
      opacity: [0.5, 1, 0.5],
      duration: 1500,
      loop: true,
      ease: 'inOutQuad',
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-border bg-card p-4 ${className}`}
      role="status"
    >
      {/* Image placeholder */}
      <div className="skeleton w-full h-32 bg-muted rounded-lg mb-4" />
      
      {/* Title placeholder */}
      <div className="skeleton w-3/4 h-4 bg-muted rounded mb-2" />
      
      {/* Description placeholder */}
      <div className="skeleton w-full h-3 bg-muted rounded mb-2" />
      <div className="skeleton w-2/3 h-3 bg-muted rounded" />
    </div>
  );
}

/**
 * LoadingOverlay Component
 * ========================
 * 
 * Full-screen loading overlay.
 * Use when entire page is loading (initial load, auth check, etc.)
 */
interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = 'Loading...', className = '' }: LoadingOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm ${className}`}
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}

/**
 * LoadingButton Component
 * ======================
 * 
 * Button that shows loading state.
 * Disables clicks and shows spinner while loading.
 */
interface LoadingButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function LoadingButton({
  children,
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
}: LoadingButtonProps) {
  return (
    <button
      className={`relative px-4 py-2 rounded-lg font-medium transition-all ${
        isLoading || disabled
          ? 'opacity-70 cursor-not-allowed'  // Grayed out when disabled
          : 'hover:opacity-90'
      } ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {/**
       * Content container
       * 
       * When loading:
       * - Original content becomes invisible (opacity: 0)
       * - Spinner appears in its place
       * - This creates a smooth transition
       */}
      <span className={isLoading ? 'invisible' : ''}>
        {children}
      </span>
      
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      )}
    </button>
  );
}
