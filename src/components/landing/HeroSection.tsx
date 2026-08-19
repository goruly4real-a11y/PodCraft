/**
 * HeroSection - Landing page hero with GSAP scroll animations
 * 
 * Features:
 * - Character-by-character title reveal
 * - 3D microphone rotation on scroll (parallax)
 * - SVG path drawing animation for mic icon
 * - Particle canvas background
 * - Elastic bounce entrance for mic
 * 
 * Uses GSAP ScrollTrigger for scroll-linked animations.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Play } from 'lucide-react';
import { ParticleCanvas } from '@/components/animations/ParticleCanvas';
import { SparkleEffect } from '@/components/animations/SparkleEffect';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const micRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title - character by character reveal
      const titleText = titleRef.current;
      if (titleText) {
        const text = titleText.innerHTML;
        const chars = text.split('').map((char) => {
          if (char === ' ') return '<span class="inline-block">&nbsp;</span>';
          if (char === '<') return char;
          return `<span class="inline-block opacity-0">${char}</span>`;
        }).join('');
        titleText.innerHTML = chars;

        gsap.to(titleText.querySelectorAll('span'), {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: 'power3.out',
          delay: 0.3,
        });

        // Set initial state for animation
        gsap.set(titleText.querySelectorAll('span'), { y: 30 });
      }

      // Subtitle
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        delay: 0.8,
      });

      // Microphone - 3D entrance with bounce
      gsap.from(micRef.current, {
        opacity: 0,
        scale: 0.3,
        rotateY: -360,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.5,
      });

      // SVG microphone drawing animation
      if (svgRef.current) {
        const paths = svgRef.current.querySelectorAll('path, line');
        paths.forEach((path) => {
          const length = (path as SVGPathElement).getTotalLength?.() || 100;
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: 'power2.inOut',
            delay: 0.8,
          });
        });
      }

      // Buttons
      gsap.from(buttonsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
        delay: 1,
      });

      // Parallax on scroll
      gsap.to(micRef.current, {
        y: 150,
        rotateX: 20,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to(titleRef.current, {
        y: -80,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      <div className="absolute inset-0">
        <ParticleCanvas particleCount={300} speed={0.3} />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          Turn Words Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            Podcasts
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          Create professional podcasts with AI-powered voices. No recording
          needed. Just write and publish.
        </p>

        <div
          ref={micRef}
          className="relative w-40 h-40 mx-auto mb-12"
          style={{ perspective: '1000px' }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
            <svg
              ref={svgRef}
              viewBox="0 0 24 24"
              className="w-20 h-20 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        </div>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <SparkleEffect>
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => navigate('/login')}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </SparkleEffect>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            See How It Works
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
