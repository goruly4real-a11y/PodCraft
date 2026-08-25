import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Play } from 'lucide-react';
import { ParticleCanvas } from '@/components/animations/ParticleCanvas';
import { Waveform } from '@/components/animations/Waveform';
import { MicrophoneCanvas } from '@/components/3d/Microphone3D';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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
      .from(canvasRef.current, {
        opacity: 0,
        scale: 0.9,
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

      gsap.to(canvasRef.current, {
        y: isMobile ? 80 : 120,
        rotation: isMobile ? 0 : 15,
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
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      <div className="absolute inset-0">
        <ParticleCanvas particleCount={isMobile ? 80 : 200} speed={0.2} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        <div
          ref={canvasRef}
          className="relative w-full max-w-md md:max-w-lg mx-auto mb-10"
          style={{ height: isMobile ? '350px' : '450px' }}
        >
          <MicrophoneCanvas />
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