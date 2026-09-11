import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mic, Github, Twitter, Menu, X } from 'lucide-react';
import { StudioConsoleLanding } from '@/components/landing/StudioConsoleLanding';
import { Waveform } from '@/components/animations/Waveform';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="bg-background">
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold font-display">PodCraft</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#speakers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Speakers</a>
            <a href="/login" className="text-sm font-medium text-primary-foreground bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Sign In</a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#speakers" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Speakers</a>
            <a href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-primary-foreground bg-primary px-4 py-2 rounded-lg text-center hover:bg-primary/90 transition-colors">Sign In</a>
          </div>
        )}
      </nav>

      <main>
        <StudioConsoleLanding />

        <footer
          ref={footerRef}
          className="py-12 px-4 border-t border-border/50 relative z-10"
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
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
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