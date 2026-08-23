import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Play } from 'lucide-react';
import { ParticleCanvas } from '@/components/animations/ParticleCanvas';
import { Waveform } from '@/components/animations/Waveform';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const micRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.from(titleRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
      })
      .from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.5')
      .from(micRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: 'back.out(1.4)',
      }, '-=0.6')
      .from(buttonsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.4')
      .from(waveformRef.current, {
        opacity: 0,
        scaleX: 0.5,
        duration: 1,
        ease: 'power2.out',
      }, '-=0.6');

      gsap.to(micRef.current, {
        y: 120,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to(titleRef.current, {
        y: -60,
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
        <ParticleCanvas particleCount={200} speed={0.2} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div
          ref={micRef}
          className="relative w-32 h-32 mx-auto mb-10"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center border border-primary/20">
            <svg
              viewBox="0 0 24 24"
              className="w-16 h-16 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight font-display"
        >
          Turn Words Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary">
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

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            size="lg"
            className="text-lg px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate('/login')}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 border-border/50"
          >
            <Play className="w-5 h-5 mr-2" />
            See How It Works
          </Button>
        </div>

        <div ref={waveformRef} className="flex justify-center">
          <Waveform barCount={60} height={50} color="var(--primary)" />
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
