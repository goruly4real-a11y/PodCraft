import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mic, Github, Twitter } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { SpeakersShowcase } from '@/components/landing/SpeakersShowcase';
import { CTASection } from '@/components/landing/CTASection';
import { Scroll3DSection } from '@/components/landing/Scroll3DSection';
import { GlowOrbs } from '@/components/animations/GlowOrbs';
import { Waveform } from '@/components/animations/Waveform';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -80,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
      });

      if (footerRef.current) {
        gsap.from(Array.from(footerRef.current.children), {
          opacity: 0,
          y: 20,
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
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold font-display">PodCraft</span>
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
        <GlowOrbs count={3} />

        <HeroSection />

        <div id="features">
          <FeaturesSection />
        </div>

        <div id="speakers">
          <SpeakersShowcase />
        </div>

        <Scroll3DSection />

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
              <span className="font-semibold font-display">PodCraft</span>
            </div>
            <div className="flex items-center gap-4">
              <Waveform barCount={20} height={16} color="var(--muted-foreground)" animated={false} />
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
