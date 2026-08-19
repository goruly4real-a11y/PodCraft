import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mic, Github, Twitter } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SpeakersShowcase } from '@/components/landing/SpeakersShowcase';
import { CTASection } from '@/components/landing/CTASection';
import { GlowOrbs } from '@/components/animations/GlowOrbs';
import { InteractiveCursor } from '@/components/cursor/InteractiveCursor';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Nav slide down
      gsap.from(navRef.current, {
        y: -100,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
      });

      // Footer reveal
      if (footerRef.current) {
        gsap.from(Array.from(footerRef.current.children), {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <InteractiveCursor />

      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">PodCraft</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#speakers"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Speakers
            </a>
            <a
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      <main>
        <GlowOrbs count={4} />

        <HeroSection />

        <div id="features">
          <FeaturesSection />
        </div>

        <div id="speakers">
          <SpeakersShowcase />
        </div>

        <CTASection />

        <footer
          ref={footerRef}
          className="py-12 px-4 border-t border-border/50"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold">PodCraft</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 PodCraft. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
