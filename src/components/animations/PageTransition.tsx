import { useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
      return;
    }

    // Exit animation
    gsap.fromTo(
      containerRef.current,
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: -15,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          // Enter animation after exit
          gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
          );
        },
      }
    );
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="min-h-screen">
      {children}
    </div>
  );
}

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'flip';
  delay?: number;
}

export function AnimatedPage({
  children,
  className = '',
  animation = 'fade',
  delay = 0,
}: AnimatedPageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const getFrom = () => {
      switch (animation) {
        case 'slide':
          return { opacity: 0, x: 30 };
        case 'scale':
          return { opacity: 0, scale: 0.95 };
        case 'flip':
          return { opacity: 0, rotateX: -10 };
        default:
          return { opacity: 0, y: 15 };
      }
    };

    gsap.from(ref.current, {
      ...getFrom(),
      duration: 0.5,
      delay,
      ease: 'power3.out',
    });
  }, [animation, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
