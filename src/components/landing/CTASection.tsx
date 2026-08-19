import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Zap } from 'lucide-react';
import { SparkleEffect } from '@/components/animations/SparkleEffect';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content reveal with 3D tilt
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 60,
        rotateX: -10,
        scale: 0.95,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });

      // Pulsing glow
      gsap.to(glowRef.current, {
        scale: 1.3,
        opacity: 0.2,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Badge pop in
      gsap.from('.badge', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      });

      // Stagger text elements
      gsap.from('.cta-text > *', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div
          ref={contentRef}
          className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-border/50 backdrop-blur-sm text-center overflow-hidden"
          style={{ perspective: '1000px' }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(e.currentTarget, {
              rotateY: x * 5,
              rotateX: -y * 5,
              duration: 0.3,
              ease: 'power2.out',
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              rotateY: 0,
              rotateX: 0,
              duration: 0.5,
              ease: 'power2.out',
            });
          }}
        >
          <div
            ref={glowRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2"
          />

          <div className="relative z-10 cta-text">
            <div className="badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Free to start
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Create Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                First Podcast?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using PodCraft to
              produce professional podcasts in minutes, not hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SparkleEffect>
                <Button
                  size="lg"
                  className="text-lg px-8"
                  onClick={() => navigate('/login')}
                >
                  Start Crafting - Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SparkleEffect>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 5 free credits • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
