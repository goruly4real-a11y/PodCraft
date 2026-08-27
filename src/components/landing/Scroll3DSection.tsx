import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollMicrophoneCanvas } from '@/components/3d/Microphone3D';

gsap.registerPlugin(ScrollTrigger);

export function Scroll3DSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative py-20 px-4 overflow-hidden bg-background"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="relative sticky top-24" style={{ height: '500px' }}>
            <ScrollMicrophoneCanvas />
          </div>

          <div className="space-y-8 pt-8 lg:pt-0">
            <div className="space-y-4">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Interactive 3D Experience
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
                Explore the Microphone
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Scroll to orbit around our studio-quality microphone. Watch the
                audio visualizer respond to sound frequencies in real-time.
                Built with React Three Fiber for buttery-smooth 60fps performance.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FeatureCard
                title="Procedural Geometry"
                description="Zero external assets — the microphone is built entirely with math and shaders for instant loading."
                icon="🔧"
              />
              <FeatureCard
                title="Scroll-Driven Camera"
                description="GSAP ScrollTrigger drives camera orbit. No Three.js scroll libraries needed."
                icon="🎮"
              />
              <FeatureCard
                title="Real-time Audio Viz"
                description="Web Audio API analyser feeds frequency data to animated bars with GSAP smoothing."
                icon="📊"
              />
              <FeatureCard
                title="Mobile Optimized"
                description="Auto-rotates on touch devices. DPR capped at 1. Performance mode enabled."
                icon="📱"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-5 bg-card/50 border border-border/50 rounded-xl hover:border-primary/50 transition-colors group">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-base font-semibold mb-1.5 font-display">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}