import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollSmoother() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        scroller: wrapperRef.current!,
        trigger: contentRef.current!,
        onUpdate: () => {
          ScrollTrigger.refresh();
        },
      });
    });

    setIsInitialized(true);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return { wrapperRef, contentRef, isInitialized };
}

export function useScrollProgress() {
  const progressRef = useRef(0);
  const sectionProgressRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const sections = document.querySelectorAll('[data-scroll-section]');
    
    sections.forEach((section) => {
      const id = section.getAttribute('data-scroll-section');
      if (!id) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          sectionProgressRef.current[id] = self.progress;
        },
        onLeave: () => {
          sectionProgressRef.current[id] = 1;
        },
        onLeaveBack: () => {
          sectionProgressRef.current[id] = 0;
        },
      });
    });

    const updateProgress = () => {
      let maxProgress = 0;
      Object.values(sectionProgressRef.current).forEach(p => {
        maxProgress = Math.max(maxProgress, p);
      });
      progressRef.current = maxProgress;
    };

    const interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, []);

  return { progress: progressRef, sectionProgress: sectionProgressRef };
}

export function useGSAPContext(scope: React.RefObject<HTMLElement>) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    ctxRef.current = gsap.context(() => {}, scope);
    return () => ctxRef.current?.revert();
  }, [scope]);

  return ctxRef;
}